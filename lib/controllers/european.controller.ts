import { EU_CONSTANTS } from './../constants';
import { BlueLinkyConfig } from './../interfaces/common.interfaces';
import * as pr from 'push-receiver';
import got from 'got';
import { ALL_ENDPOINTS, EU_BASE_URL } from '../constants';
import { Vehicle } from '../vehicles/vehicle';
import EuropeanVehicle from '../vehicles/europeanVehicle';
import { SessionController } from './controller';

import logger from '../logger';
import { URLSearchParams } from 'url';

import { CookieJar } from 'tough-cookie';
import { RegisterVehicleConfig } from '../interfaces/common.interfaces';

export class EuropeanController extends SessionController {
  constructor(userConfig: BlueLinkyConfig) {
    super(userConfig);
    logger.debug(`EU Controller created`);

    this.session.deviceId = this.uuidv4();
  }

  private vehicles: Array<EuropeanVehicle> = [];

  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public async refreshAccessToken(): Promise<string> {
    return this.login();
  }

  async enterPin(): Promise<string> {
    if (this.session.accessToken === '') {
      Promise.reject('Token not set');
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
    this.session.controlTokenExpiresAt = new Date().getTime() + 1000 * 60 * 10;
    return Promise.resolve('PIN entered OK, The pin is valid for 10 minutes');
  }

  async login(): Promise<string> {
    try {
      // request cookie via got and store it to the cookieJar
      const cookieJar = new CookieJar();
      await got(ALL_ENDPOINTS.EU.session, { cookieJar });

      const authCodeResponse = await got(ALL_ENDPOINTS.EU.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
        body: {
          email: this.userConfig.username,
          password: this.userConfig.password,
        },
        cookieJar,
      });

      const queryString = authCodeResponse.body.redirectUrl.split('?')[1];
      const urlParams = new URLSearchParams(queryString);
      const authToken = urlParams.get('code');

      if (authToken !== null) {
        this.session.refreshToken = authToken;
      } else {
        throw new Error('@EuropeControllerLogin: AuthCode was not found');
      }

      const credentials = await pr.register(EU_CONSTANTS.GCMSenderID);
      const notificationReponse = await got(`${EU_BASE_URL}/api/v1/spa/notifications/register`, {
        method: 'POST',
        headers: {
          'ccsp-service-id': '6d477c38-3ca4-4cf3-9557-2a1929a94654',
          'Content-Type': 'application/json;charset=UTF-8',
          'Content-Length': '231',
          'Host': 'prd.eu-ccapi.hyundai.com:8080',
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

      this.session.deviceId = notificationReponse.body.resMsg.deviceId;

      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', ALL_ENDPOINTS.EU.redirectUri);
      formData.append('code', this.session.refreshToken);

      const response = await got(ALL_ENDPOINTS.EU.token, {
        method: 'POST',
        headers: {
          'Authorization': EU_CONSTANTS.basicToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': '154',
          'Host': 'prd.eu-ccapi.hyundai.com:8080',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'okhttp/3.10.0',
          'grant_type': 'authorization_code',
        },
        body: formData.toString(),
        cookieJar,
      });

      const responseBody = JSON.parse(response.body);
      this.session.accessToken = 'Bearer ' + responseBody.access_token;

      logger.debug(
        `Login successful for user ${this.userConfig.username}`,
        this.session.accessToken
      );

      return Promise.resolve('Login success');
    } catch (err) {
      logger.debug(JSON.stringify(err.message));
      return Promise.reject(err.message);
    }
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    if (this.session.accessToken === undefined) {
      return Promise.reject('Token not set');
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
        // master: v.master,
        nickname: v.nickname,
        name: v.vehicleName,
        regDate: v.regDate,
        // type: v.type,
        brandIndicator: 'H',
        // id: v.vehicleId,
        vin: vehicleProfile.vinInfo[0].basic.vin,
        generation: vehicleProfile.vinInfo[0].basic.modelYear,
      } as RegisterVehicleConfig;

      this.vehicles.push(new EuropeanVehicle(vehicleConfig, this));
      logger.info(`Added vehicle ${vehicleConfig.id}`);
    });

    logger.debug(`Success! Got ${this.vehicles.length} vehicles`);
    return Promise.resolve(this.vehicles);
  }

  // TODO: type this or replace it with a normal loop
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async asyncForEach(array, callback): Promise<any> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
