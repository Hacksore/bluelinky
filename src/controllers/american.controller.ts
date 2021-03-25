import { BlueLinkyConfig } from './../interfaces/common.interfaces';
import got from 'got';

import { Vehicle } from '../vehicles/vehicle';
import AmericanVehicle from '../vehicles/american.vehicle';
import { SessionController } from './controller';

import logger from '../logger';
import { getBrandEnvironment, AmericaBrandEnvironment } from '../constants/america';

import { VehicleRegisterOptions } from '../interfaces/common.interfaces';
import { manageBluelinkyError } from '../tools/common.tools';
import { REGIONS } from '../constants';

export interface AmericanBlueLinkyConfig extends BlueLinkyConfig {
  region: REGIONS.US;
}

export class AmericanController extends SessionController<AmericanBlueLinkyConfig> {
  private _environment: AmericaBrandEnvironment;

  constructor(userConfig: AmericanBlueLinkyConfig) {
    super(userConfig);
    this._environment = getBrandEnvironment(userConfig.brand);
    logger.debug('US Controller created');
  }

  public get environment(): AmericaBrandEnvironment {
    return this._environment;
  }

  private vehicles: Array<AmericanVehicle> = [];

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(Date.now() / 1000 - this.session.tokenExpiresAt) >= -10;

    try {
      if (this.session.refreshToken && shouldRefreshToken) {
        logger.debug('refreshing token');
        const response = await got(`${this.environment.baseUrl}/v2/ac/oauth/token/refresh`, {
          method: 'POST',
          body: {
            'refresh_token': this.session.refreshToken,
          },
          headers: {
            'User-Agent': 'PostmanRuntime/7.26.10',
            'client_secret': this.environment.clientSecret,
            'client_id': this.environment.clientId,
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
    } catch (err) {
      throw manageBluelinkyError(err, 'AmericanController.refreshAccessToken');
    }
  }

  // TODO: come up with a better return value?
  public async login(): Promise<string> {
    logger.debug('Logging in to the API');
    try {
      const response = await got(`${this.environment.baseUrl}/v2/ac/oauth/token`, {
        method: 'POST',
        body: {
          username: this.userConfig.username,
          password: this.userConfig.password,
        },
        headers: {
          'User-Agent': 'PostmanRuntime/7.26.10',
          'client_id': this.environment.clientId,
          'client_secret': this.environment.clientSecret,
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
    } catch (err) {
      throw manageBluelinkyError(err, 'AmericanController.login');
    }
  }

  public async logout(): Promise<string> {
    return 'OK';
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    try {
      const response = await got(`${this.environment.baseUrl}/ac/v2/enrollment/details/${this.userConfig.username}`, {
        method: 'GET',
        headers: {
          'access_token': this.session.accessToken,
          'client_id': this.environment.clientId,
          'Host': this.environment.host,
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

      this.vehicles = data.enrolledVehicleDetails.map(vehicle => {
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
        return new AmericanVehicle(vehicleConfig, this);
      });

      return this.vehicles;
    } catch (err) {
      throw manageBluelinkyError(err, 'AmericanController.getVehicles');
    }
  }
}
