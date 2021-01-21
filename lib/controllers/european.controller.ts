import { EU_CONSTANTS, EU_BASE_URL, EU_API_HOST, EU_CLIENT_ID } from './../constants/europe';
import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import * as pr from 'push-receiver';
import got from 'got';
import { ALL_ENDPOINTS } from '../constants';
import { Vehicle } from '../vehicles/vehicle';
import EuropeanVehicle from '../vehicles/european.vehicle';
import { SessionController } from './controller';

import logger from '../logger';
import { URLSearchParams } from 'url';

import { CookieJar } from 'tough-cookie';
import { VehicleRegisterOptions } from '../interfaces/common.interfaces';

export class EuropeanController extends SessionController {
  constructor(userConfig: BlueLinkyConfig) {
    super(userConfig);
    logger.debug('EU Controller created');

    this.session.deviceId = this.uuidv4();
  }

  session: Session = {
    accessToken: undefined,
    refreshToken: undefined,
    controlToken: undefined,
    deviceId: this.uuidv4(),
    tokenExpiresAt: 0,
    controlTokenExpiresAt: 0,
  };

  private vehicles: Array<EuropeanVehicle> = [];

  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(Date.now() / 1000 - this.session.tokenExpiresAt) >= -10;

    if (!this.session.refreshToken) {
      logger.debug('Need refresh token to refresh access token. Use login()');
      return 'Need refresh token to refresh access token. Use login()';
    }

    if (!shouldRefreshToken) {
      logger.debug('Token not expired, no need to refresh');
      return 'Token not expired, no need to refresh';
    }

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('redirect_uri', 'https://www.getpostman.com/oauth2/callback'); // Oversight from Hyundai developers
    formData.append('refresh_token', this.session.refreshToken);

    const response = await got(ALL_ENDPOINTS.EU.token, {
      method: 'POST',
      headers: {
        'Authorization': EU_CONSTANTS.basicToken,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': EU_API_HOST,
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'okhttp/3.10.0',
      },
      body: formData.toString(),
      throwHttpErrors: false,
    });

    if (response.statusCode !== 200) {
      logger.debug(`Refresh token failed: ${response.body}`);
      return `Refresh token failed: ${response.body}`;
    }

    const responseBody = JSON.parse(response.body);
    this.session.accessToken = 'Bearer ' + responseBody.access_token;
    this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + responseBody.expires_in);

    logger.debug('Token refreshed');
    return 'Token refreshed';
  }

  public async enterPin(): Promise<string> {
    if (this.session.accessToken === '') {
      throw 'Token not set';
    }

    const response = await got(`${EU_BASE_URL}/api/v1/user/pin`, {
      method: 'PUT',
      headers: {
        'Authorization': this.session.accessToken,
        'Content-Type': 'application/json',
      },
      body: {
        deviceId: this.session.deviceId,
        pin: this.userConfig.pin,
      },
      json: true,
    });

    this.session.controlToken = 'Bearer ' + response.body.controlToken;
    this.session.controlTokenExpiresAt = Math.floor(Date.now() / 1000 + response.body.expiresTime);
    return 'PIN entered OK, The pin is valid for 10 minutes';
  }

  public async login(): Promise<string> {
    try {
      // request cookie via got and store it to the cookieJar
      const cookieJar = new CookieJar();
      await got(ALL_ENDPOINTS.EU.session, { cookieJar });

      // required by the api to set lang
      await got(ALL_ENDPOINTS.EU.language, { method: 'POST', body: '{"lang":"en"}', cookieJar });

      const authCodeResponse = await got(ALL_ENDPOINTS.EU.login, {
        method: 'POST',
        json: true,
        body: {
          'email': this.userConfig.username,
          'password': this.userConfig.password,
        },
        cookieJar,
      });

      logger.debug(authCodeResponse.body);
      let authorizationCode;
      if (authCodeResponse) {
        const regexMatch = /code=([^&]*)/g.exec(authCodeResponse.body.redirectUrl);
        if (regexMatch !== null) {
          authorizationCode = regexMatch[1];
        } else {
          throw new Error('@EuropeControllerLogin: AuthCode was not found');
        }
      }

      const credentials = await pr.register(EU_CONSTANTS.GCMSenderID);
      const notificationReponse = await got(`${EU_BASE_URL}/api/v1/spa/notifications/register`, {
        method: 'POST',
        headers: {
          'ccsp-service-id': EU_CLIENT_ID,
          'Content-Type': 'application/json;charset=UTF-8',
          'Host': EU_API_HOST,
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'okhttp/3.10.0',
        },
        body: {
          pushRegId: credentials.gcm.token,
          pushType: 'GCM',
          uuid: this.session.deviceId,
        },
        json: true,
      });

      if (notificationReponse) {
        this.session.deviceId = notificationReponse.body.resMsg.deviceId;
      }

      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', ALL_ENDPOINTS.EU.redirectUri);
      formData.append('code', authorizationCode);

      const response = await got(ALL_ENDPOINTS.EU.token, {
        method: 'POST',
        headers: {
          'Authorization': EU_CONSTANTS.basicToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': EU_API_HOST,
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'okhttp/3.10.0',
          'grant_type': 'authorization_code',
        },
        body: formData.toString(),
        cookieJar,
      });

      if (response.statusCode !== 200) {
        throw `Get token failed: ${response.body}`;
      }

      if (response) {
        const responseBody = JSON.parse(response.body);
        this.session.accessToken = 'Bearer ' + responseBody.access_token;
        this.session.refreshToken = responseBody.refresh_token;
        this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + responseBody.expires_in);
      }

      return 'Login success';
    } catch (err) {
      throw err.message;
    }
  }

  public async logout(): Promise<string> {
    return 'OK';
  }

  public async getVehicles(): Promise<Array<Vehicle>> {
    if (this.session.accessToken === undefined) {
      throw 'Token not set';
    }

    const response = await got(`${EU_BASE_URL}/api/v1/spa/vehicles`, {
      method: 'GET',
      headers: {
        'Authorization': this.session.accessToken,
        'ccsp-device-id': this.session.deviceId,
      },
      json: true,
    });

    this.vehicles = [];

    await this.asyncForEach(response.body.resMsg.vehicles, async v => {
      const vehicleProfileReponse = await got(
        `${EU_BASE_URL}/api/v1/spa/vehicles/${v.vehicleId}/profile`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.session.accessToken,
            'ccsp-device-id': this.session.deviceId,
          },
          json: true,
        }
      );

      const vehicleProfile = vehicleProfileReponse.body.resMsg;

      const vehicleConfig = {
        nickname: v.nickname,
        name: v.vehicleName,
        regDate: v.regDate,
        brandIndicator: 'H',
        id: v.vehicleId,
        vin: vehicleProfile.vinInfo[0].basic.vin,
        generation: vehicleProfile.vinInfo[0].basic.modelYear,
      } as VehicleRegisterOptions;

      this.vehicles.push(new EuropeanVehicle(vehicleConfig, this));
      logger.debug(`Added vehicle ${vehicleConfig.id}`);
    });

    return this.vehicles;
  }

  // TODO: type this or replace it with a normal loop
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async asyncForEach(array: any, callback: any): Promise<any> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
