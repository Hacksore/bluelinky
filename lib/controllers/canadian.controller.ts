import { BlueLinkyConfig, Session } from '../interfaces/common.interfaces';
import { Vehicle } from '../vehicles/vehicle';
import CanadianVehicle from '../vehicles/canadianVehicle';
import SessionController from './controller';

import logger from '../logger';
import { BASE_URL, CLIENT_ORIGIN } from '../constants/canada';
import { REGIONS } from '../constants';

export class CanadianController implements SessionController {
  constructor(config: BlueLinkyConfig) {
    this.config = config;
    logger.info(`${this.config.region} Controller created`);
  }

  session: Session = {
    accessToken: '',
    refreshToken: '',
    controlToken: '',
    deviceId: '',
    tokenExpiresAt: 0
  };

  private vehicles: Array<CanadianVehicle> = [];

  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: REGIONS.CA,
    vin: null,
    autoLogin: true,
    pin: null,
    deviceUuid: null,
  };

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(((+new Date() / 1000)) - this.session.tokenExpiresAt) <= 10;

    if (this.session.refreshToken && shouldRefreshToken) {
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
      this.session.tokenExpiresAt = Math.floor((+new Date() / 1000) + response.body.expires_in);

      return Promise.resolve('Token refreshed');
    }

    return Promise.resolve('Token not expired, no need to refresh');
  }

  public async login(): Promise<string> {

    return Promise.reject('login bad');
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    console.log('getVehicleList');
    const token = this.bluelinky.getAccessToken() || '';
    const response = await this._request(this.endpoints.vehicleList, {});
    console.log(JSON.stringify(response.body, null, 2));
    return response.body.result.vehicles;
    // return Promise.resolve(this.vehicles);
  }


  //////////////////////////////////////////////////////////////////////////////
  // Account
  //////////////////////////////////////////////////////////////////////////////

  async myAccount(): Promise<any> {
    logger.info('Begin myAccount request');
    const response = await this._request(this.endpoints.myAccount, {});
    return response.body.result;
  }

  async nextService(): Promise<any> {
    logger.info('Begin nextService request');
    const response = await this._request(this.endpoints.nextService, {});
    return response.body;
  }

  async preferedDealer(): Promise<any> {
    logger.info('Begin preferedDealer request');
    const response = await this._request(this.endpoints.preferedDealer, {});
    return response.body;
  }
}
