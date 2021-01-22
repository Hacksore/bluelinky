import { BlueLinkyConfig } from './../interfaces/common.interfaces';
import got from 'got';

import { Vehicle } from '../vehicles/vehicle';
import AmericanVehicle from '../vehicles/american.vehicle';
import { SessionController } from './controller';

import logger from '../logger';
import { BASE_URL, CLIENT_ID, CLIENT_SECRET, API_HOST } from '../constants/america';

import { VehicleRegisterOptions } from '../interfaces/common.interfaces';
export class AmericanController extends SessionController {
  constructor(userConfig: BlueLinkyConfig) {
    super(userConfig);
    logger.debug('US Controller created');
  }

  private vehicles: Array<AmericanVehicle> = [];

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(Date.now() / 1000 - this.session.tokenExpiresAt) >= -10;

    if (this.session.refreshToken && shouldRefreshToken) {
      logger.debug('refreshing token');
      const response = await got(`${BASE_URL}/v2/ac/oauth/token/refresh`, {
        method: 'POST',
        body: {
          'refresh_token': this.session.refreshToken,
        },
        headers: {
          'client_secret': CLIENT_SECRET,
          'client_id': CLIENT_ID,
        },
        json: true,
      });

      logger.debug(response.body);
      this.session.accessToken = response.body.access_token;
      this.session.refreshToken = response.body.refresh_token;
      this.session.tokenExpiresAt = Math.floor(
        +new Date() / 1000 + parseInt(response.body.expires_in)
      );

      logger.debug('Token refreshed');
      return 'Token refreshed';
    }

    logger.debug('Token not expired, no need to refresh');
    return 'Token not expired, no need to refresh';
  }

  // TODO: come up with a better return value?
  public async login(): Promise<string> {
    logger.debug('Logging in to the API');

    const response = await got(`${BASE_URL}/v2/ac/oauth/token`, {
      method: 'POST',
      body: {
        username: this.userConfig.username,
        password: this.userConfig.password,
      },
      headers: {
        'client_secret': CLIENT_SECRET,
        'client_id': CLIENT_ID,
      },
      json: true,
    });

    logger.debug(response.body);
    
    if (response.statusCode !== 200) {
      return 'login bad';
    }

    this.session.accessToken = response.body.access_token;
    this.session.refreshToken = response.body.refresh_token;
    this.session.tokenExpiresAt = Math.floor(
      +new Date() / 1000 + parseInt(response.body.expires_in)
    );

    return 'login good';
  }

  public async logout(): Promise<string> {
    return 'OK';
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    const response = await got(`${BASE_URL}/ac/v2/enrollment/details/${this.userConfig.username}`, {
      method: 'GET',
      headers: {
        'access_token': this.session.accessToken,
        'client_id': CLIENT_ID,
        'Host': API_HOST,
        'User-Agent': 'okhttp/3.12.0',
        'payloadGenerated': '20200226171938',
        'includeNonConnectedVehicles': 'Y',
      },
    });

    const data = JSON.parse(response.body);

    if (data.enrolledVehicleDetails === undefined) {
      this.vehicles = [];
      return this.vehicles;
    }

    data.enrolledVehicleDetails.forEach(vehicle => {
      const vehicleInfo = vehicle.vehicleDetails;
      const vehicleConfig = {
        nickname: vehicleInfo.nickName,
        name: vehicleInfo.nickName,
        vin: vehicleInfo.vin,
        regDate: vehicleInfo.enrollmentDate,
        brandIndicator: vehicleInfo.brandIndicator,
        regId: vehicleInfo.regid,
        generation: vehicleInfo.modelYear > 2016 ? '2' : '1',
      } as VehicleRegisterOptions;

      this.vehicles.push(new AmericanVehicle(vehicleConfig, this));
    });

    return this.vehicles;
  }
}
