import got from 'got';
import { VehicleStatus, VehicleLocation, Odometer, BlueLinkyConfig, Session } from '../interfaces/common.interfaces';
import { ALL_ENDPOINTS, CA_BASE_URL, CA_ENDPOINTS } from '../constants';
import { Vehicle } from '../vehicles/vehicle';
import CanadianVehicle from '../vehicles/canadianVehicle';
import SessionController from './controller';

import logger from '../logger';
import { BASE_URL, CLIENT_ORIGIN } from '../constants/canada';
import { REGIONS } from '../constants';

export class CanadianController implements SessionController {
  private _status: VehicleStatus | null = null;

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
    username: undefined,
    password: undefined,
    region: REGIONS.CA,
    autoLogin: true,
    pin: undefined,
    vin: undefined,
    vehicleId: undefined,
    deviceUuid: undefined,
  };

  private timeOffset = -(new Date().getTimezoneOffset() / 60) 

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(((+new Date() / 1000)) - this.session.tokenExpiresAt) <= 10;

    // if (this.session.refreshToken && shouldRefreshToken) {
    //   const response = await got(`${BASE_URL}/v2/ac/oauth/token/refresh`, {
    //     method: 'POST',
    //     body: {
    //       'refresh_token': this.session.refreshToken
    //     },
    //     headers: {
    //       'client_secret': CLIENT_SECRET,
    //       'client_id': CLIENT_ID
    //     },
    //     json: true
    //   });

      // this.session.accessToken = response.body.access_token;
      // this.session.refreshToken = response.body.refresh_token;
      // this.session.tokenExpiresAt = Math.floor((+new Date() / 1000) + response.body.expires_in);

    //   return Promise.resolve('Token refreshed');
    // }

    return Promise.resolve('Token not expired, no need to refresh');
  }

  public async login(): Promise<string> {
    try {
      const response = await this.request(
        CA_ENDPOINTS.login,
        {
          loginId: this.config.username,
          password: this.config.password
        })

      if (response.responseHeader.responseCode != 0)
      {
        return Promise.reject('bad login: ' + response.responseHeader.responseDesc)
      }

      this.session.accessToken = response.result.accessToken;
      this.session.refreshToken = response.result.refreshToken;
      this.session.tokenExpiresAt = Math.floor((+new Date()/1000) + response.result.expireIn);

      return Promise.resolve('login good');
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    console.log('getVehicleList');
    const response = await this.request(
      CA_ENDPOINTS.vehicleList, {});
 
    const data = response.result
    if (data.vehicles === undefined) {
      this.vehicles = [];
      return Promise.reject('No vehicles found for account!');
    }

    data.vehicles.forEach(vehicle => {
      const config = {
        pin: this.config.pin,
        vehicleId: vehicle.vehicleId,
        vin: vehicle.vin,
        nickname: vehicle.nickName,
        defaultVehicle: vehicle.defaultVehicle,
        modelName: vehicle.modelName,
        modelYear: vehicle.modelYear,
        fuelKindCode: vehicle.fuelKindCode,
        genType: vehicle.genType,
        subscriptionEndDate: vehicle.subscriptionEndDate,
        mileageForNextService: vehicle.mileageForNextService,
        daysForNextService: vehicle.daysForNextService
      }
      this.vehicles.push(new CanadianVehicle(config, this));
    })

    return Promise.resolve(this.vehicles);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Account
  //////////////////////////////////////////////////////////////////////////////

  async myAccount(): Promise<any> {
    logger.info('Begin myAccount request');
    const response = await this.request(ALL_ENDPOINTS.CA.myAccount, {});
    return response.result;
  }

  async nextService(): Promise<any> {
    logger.info('Begin nextService request');
    const response = await this.request(ALL_ENDPOINTS.CA.nextService, {});
    return response;
  }

  async preferedDealer(): Promise<any> {
    logger.info('Begin preferedDealer request');
    const response = await this.request(ALL_ENDPOINTS.CA.preferedDealer, {});
    return response;
  }


  //////////////////////////////////////////////////////////////////////////////
  // Internal
  //////////////////////////////////////////////////////////////////////////////

  private async getPreAuth() {
    const response = await this.request(ALL_ENDPOINTS.CA.verifyPin, {});
    const pAuth = response.result.pAuth;
    logger.info('pAuth ' + pAuth);
    return pAuth;
  }

  private async request(endpoint, body: object, headers: object = {}, ): Promise<any | null> {
    logger.info(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);

    try {
      const response = await got(endpoint, {
        method: 'POST',
        json: true,
        headers: {
          from: 'SPA',
          language: 1,
          offset: this.timeOffset,
          // pin: this.config.pin,
          accessToken: this.session.accessToken,
          // vehicleId: this.config.vehicleId,
          ...headers
        },
        body: {
          ...body
        }
      });


      if (response.body.responseHeader.responseCode != 0)
      {
        return Promise.reject('bad request: ' + response.body.responseHeader.responseDesc)
      }

      return Promise.resolve(response.body);
    } catch (err) {
      console.error(err)
      return Promise.reject('error: ' + err)
    }
  }
}
