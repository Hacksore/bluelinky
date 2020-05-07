import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import got from 'got';

import { Vehicle } from '../vehicles/vehicle';
import AmericanVehicle from '../vehicles/americanVehicle';
import SessionController from './controller';

import logger from '../logger';
import { BASE_URL, CLIENT_ID, CLIENT_SECRET, API_HOST } from '../constants/america';
import { REGIONS } from '../constants';

// const got = _got;
export class AmericanController implements SessionController {
  constructor(config: BlueLinkyConfig) {
    this.config = config;
    logger.info(`${this.config.region} Controller created`);
  }
  
  private vehicles: Array<AmericanVehicle> = [];
  
  public session: Session = {
    accessToken: '',
    refreshToken: '',
    controlToken: '',
    deviceId: '',
    tokenExpiresAt: 0
  };

  public config: BlueLinkyConfig = {
    username: undefined,
    password: undefined,
    region: REGIONS.US,
    autoLogin: true,
    pin: undefined,
    vin: undefined,
    vehicleId: undefined
  };

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(((+new Date()/1000)) - this.session.tokenExpiresAt) <= 10;

    if (this.session.refreshToken && shouldRefreshToken) {
      logger.debug('refreshing token');
      const response = await got(`${BASE_URL}/v2/ac/oauth/token/refresh`, {
        method: 'POST',
        body: {
          'refresh_token': this.session.refreshToken
        },
        headers: {
          'client_secret': CLIENT_SECRET,
          'client_id': CLIENT_ID
        },
        json: true
      });  

      this.session.accessToken = response.body.access_token;
      this.session.refreshToken = response.body.refresh_token;
      this.session.tokenExpiresAt = Math.floor((+new Date()/1000) + parseInt(response.body.expires_in));

      return Promise.resolve('Token refreshed');
    }
    
    return Promise.resolve('Token not expired, no need to refresh');
  }

  public async login(): Promise<string> {
    
    try {
      const response = await got(`${BASE_URL}/v2/ac/oauth/token`, {
        method: 'POST',
        body: {
          username: this.config.username,
          password: this.config.password
        },
        headers: {
          'client_secret': CLIENT_SECRET,
          'client_id': CLIENT_ID
        },
        json: true
      });

      this.session.accessToken = response.body.access_token;
      this.session.refreshToken = response.body.refresh_token;
      this.session.tokenExpiresAt = Math.floor((+new Date()/1000) + parseInt(response.body.expires_in));

      return Promise.resolve('login good');
    } catch (err) {
      Promise.reject(err);
    }

    return Promise.reject('login bad');
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  async getVehicles(): Promise<Array<Vehicle>> {

    const response = await got(`${BASE_URL}/ac/v2/enrollment/details/${this.config.username}`, {
      method: 'GET',
      headers: {
        'access_token': this.session.accessToken,
        'client_id': CLIENT_ID,
        'Host': API_HOST,
        'User-Agent': 'okhttp/3.12.0',
        'payloadGenerated': '20200226171938',
        'includeNonConnectedVehicles': 'Y'
      }
    });

    const data = JSON.parse(response.body);

    if (data.enrolledVehicleDetails === undefined) {
      this.vehicles = [];
      return Promise.resolve(this.vehicles);
    }

    data.enrolledVehicleDetails.forEach(vehicle => {
      const vehicleInfo = vehicle.vehicleDetails;
    
      const config = {
        nickname: vehicleInfo.nickName,
        vin: vehicleInfo.vin,
        regDate: vehicleInfo.enrollmentDate,
        brandIndicator: vehicleInfo.brandIndicator,
        regId: vehicleInfo.regid,
        // unsure if this is right but the new endpoint does not seem to have gen        
        gen: vehicleInfo.modelYear > 2016 ? '2' : '1',
        name: vehicleInfo.nickName
      }
      this.vehicles.push(new AmericanVehicle(config, this));
    });

    return Promise.resolve(this.vehicles);
  }
}
