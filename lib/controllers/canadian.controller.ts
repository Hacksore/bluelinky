import got from 'got';
import { AccountInfo, BlueLinkyConfig, PreferedDealer } from '../interfaces/common.interfaces';
import { CA_ENDPOINTS, CLIENT_ORIGIN } from '../constants/canada';
import { Vehicle } from '../vehicles/vehicle';
import CanadianVehicle from '../vehicles/canadian.vehicle';
import { SessionController } from './controller';

import logger from '../logger';
import { VehicleRegisterOptions } from '../interfaces/common.interfaces';

export class CanadianController extends SessionController {
  private _preferredDealer: PreferedDealer | null = null;
  private _accountInfo: AccountInfo | null = null;

  constructor(userConfig: BlueLinkyConfig) {
    super(userConfig);
    logger.debug('CA Controller created');
  }

  private vehicles: Array<CanadianVehicle> = [];
  private timeOffset = -(new Date().getTimezoneOffset() / 60);

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(+new Date() / 1000 - this.session.tokenExpiresAt) <= 10;

    if (this.session.refreshToken && shouldRefreshToken) {
      // TODO , right call ?
      const response = await this.request(CA_ENDPOINTS.verifyToken, {}, {});

      this.session.accessToken = response.body.access_token;
      this.session.refreshToken = response.body.refresh_token;
      this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + response.body.expires_in);

      return 'Token refreshed';
    }

    return 'Token not expired, no need to refresh';
  }

  public async login(): Promise<string> {
    logger.info('Begin login request');
    try {
      const response = await this.request(CA_ENDPOINTS.login, {
        loginId: this.userConfig.username,
        password: this.userConfig.password,
      });

      this.session.accessToken = response.result.accessToken;
      this.session.refreshToken = response.result.refreshToken;
      this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + response.result.expireIn);

      return 'login good';
    } catch (err) {
      return 'error: ' + err;
    }
  }

  async logout(): Promise<string> {
    return 'OK';
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    logger.info('Begin getVehicleList request');
    try {
      const response = await this.request(CA_ENDPOINTS.vehicleList, {});

      const data = response.result;
      if (data.vehicles === undefined) {
        this.vehicles = [];
        return this.vehicles;
      }

      data.vehicles.forEach(vehicle => {
        const vehicleConfig = {
          nickname: vehicle.nickName,
          name: vehicle.nickName,
          vin: vehicle.vin,
          regDate: vehicle.enrollmentDate,
          brandIndicator: vehicle.brandIndicator,
          regId: vehicle.regid,
          generation: vehicle.genType,
        } as VehicleRegisterOptions;

        this.vehicles.push(new CanadianVehicle(vehicleConfig, this));
      });

      return this.vehicles;
    } catch (err) {
      logger.debug(err);
      return this.vehicles;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Account
  //////////////////////////////////////////////////////////////////////////////
  // TODO: deprecated account specific data
  public async myAccount(): Promise<AccountInfo> {
    logger.info('Begin myAccount request');
    try {
      const response = await this.request(CA_ENDPOINTS.myAccount, {});
      this._accountInfo = response.result as AccountInfo;
      return this._accountInfo;
    } catch (err) {
      throw err.message;
    }
  }

  // TODO: deprecated account specific data
  public async preferedDealer(): Promise<PreferedDealer | null> {
    logger.info('Begin preferedDealer request');
    try {
      const response = await this.request(CA_ENDPOINTS.preferedDealer, {});
      this._preferredDealer = response.result as PreferedDealer;
      return this._preferredDealer;
    } catch (err) {
      throw err.message;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Internal
  //////////////////////////////////////////////////////////////////////////////

  // TODO: not quite sure how to type this if it's dynamic?
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private async request(endpoint, body: any, headers: any = {}): Promise<any | null> {
    logger.debug(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);
    try {
      const response = await got(endpoint, {
        method: 'POST',
        json: true,
        headers: {
          from: CLIENT_ORIGIN,
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
        throw response.body.responseHeader.responseDesc;
      }

      return response.body;
    } catch (err) {
      throw err.message;
    }
  }
}
