import got from 'got';
import { VehicleStatus, BlueLinkyConfig, Session } from '../interfaces/common.interfaces';
import { CA_ENDPOINTS } from '../constants';
import { Vehicle } from '../vehicles/vehicle';
import CanadianVehicle from '../vehicles/canadianVehicle';
import SessionController from './controller';

import logger from '../logger';
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
    tokenExpiresAt: 0,
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

  private timeOffset = -(new Date().getTimezoneOffset() / 60);

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(+new Date() / 1000 - this.session.tokenExpiresAt) <= 10;

    if (this.session.refreshToken && shouldRefreshToken) {
      // TODO , right call ?
      const response = await this.request(CA_ENDPOINTS.verifyToken, {}, {});

      this.session.accessToken = response.body.access_token;
      this.session.refreshToken = response.body.refresh_token;
      this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + response.body.expires_in);

      return Promise.resolve('Token refreshed');
    }

    return Promise.resolve('Token not expired, no need to refresh');
  }

  public async login(): Promise<string> {
    logger.info('Begin login request');
    try {
      const response = await this.request(CA_ENDPOINTS.login, {
        loginId: this.config.username,
        password: this.config.password,
      });

      this.session.accessToken = response.result.accessToken;
      this.session.refreshToken = response.result.refreshToken;
      this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + response.result.expireIn);

      return Promise.resolve('login good');
    } catch (err) {
      return Promise.reject('error: ' + err);
    }
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    logger.info('Begin getVehicleList request');
    try {
      const response = await this.request(CA_ENDPOINTS.vehicleList, {});

      const data = response.result;
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
          daysForNextService: vehicle.daysForNextService,
        };
        this.vehicles.push(new CanadianVehicle(config, this));
      });

      return Promise.resolve(this.vehicles);
    } catch (err) {
      return Promise.reject('error: ' + err);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Account
  //////////////////////////////////////////////////////////////////////////////

  public async myAccount(): Promise<string> {
    logger.info('Begin myAccount request');
    try {
      const response = await this.request(CA_ENDPOINTS.myAccount, {});
      return Promise.resolve(response.result);
    } catch (err) {
      return Promise.reject('error: ' + err);
    }
  }

  public async preferedDealer(): Promise<string> {
    logger.info('Begin preferedDealer request');
    try {
      const response = await this.request(CA_ENDPOINTS.preferedDealer, {});
      return Promise.resolve(response.result);
    } catch (err) {
      return Promise.reject('error: ' + err);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Internal
  //////////////////////////////////////////////////////////////////////////////

  private async request(endpoint, body: object, headers: object = {}): Promise<any | null> {
    logger.info(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);
    try {
      const response = await got(endpoint, {
        method: 'POST',
        json: true,
        headers: {
          from: 'SPA',
          language: 1,
          offset: this.timeOffset,
          accessToken: this.session.accessToken,
          ...headers,
        },
        body: {
          ...body,
        },
      });

      if (response.body.responseHeader.responseCode != 0) {
        return Promise.reject('bad request: ' + response.body.responseHeader.responseDesc);
      }

      return Promise.resolve(response.body);
    } catch (err) {
      console.error(err);
      return Promise.reject('error: ' + err);
    }
  }
}
