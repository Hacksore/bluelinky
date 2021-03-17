import { getBrandEnvironment, EuropeanBrandEnvironment, DEFAULT_LANGUAGE, EULanguages, EU_LANGUAGES } from './../constants/europe';
import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import * as pr from 'push-receiver';
import got from 'got';
import { REGIONS } from '../constants';
import { Vehicle } from '../vehicles/vehicle';
import EuropeanVehicle from '../vehicles/european.vehicle';
import { SessionController } from './controller';

import logger from '../logger';
import { URLSearchParams } from 'url';

import { CookieJar } from 'tough-cookie';
import { VehicleRegisterOptions } from '../interfaces/common.interfaces';
import { asyncMap, manageBluelinkyError, uuidV4 } from '../tools/common.tools';

export interface EuropeBlueLinkyConfig extends BlueLinkyConfig {
  language?: EULanguages;
  region: REGIONS.EU;
}

interface EuropeanVehicleDescription {
  nickname: string;
  vehicleName: string;
  regDate: string;
  vehicleId: string;
}

export class EuropeanController extends SessionController<EuropeBlueLinkyConfig> {
  private _environment: EuropeanBrandEnvironment;
  constructor(userConfig: EuropeBlueLinkyConfig) {
    super(userConfig);
    this.userConfig.language = userConfig.language ?? DEFAULT_LANGUAGE;
    if (!EU_LANGUAGES.includes(this.userConfig.language)) {
      throw new Error(`The language code ${this.userConfig.language} is not managed. Only ${EU_LANGUAGES.join(', ')} are.`);
    }
    this.session.deviceId = uuidV4();
    this._environment = getBrandEnvironment(userConfig.brand);
    logger.debug('EU Controller created');
  }

  public get environment(): EuropeanBrandEnvironment {
    return this._environment;
  }

  public session: Session = {
    accessToken: undefined,
    refreshToken: undefined,
    controlToken: undefined,
    deviceId: uuidV4(),
    tokenExpiresAt: 0,
    controlTokenExpiresAt: 0,
  };

  private vehicles: Array<EuropeanVehicle> = [];

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

    try {
      const response = await got(this.environment.endpoints.token, {
        method: 'POST',
        headers: {
          'Authorization': this.environment.basicToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': this.environment.host,
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
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeController.refreshAccessToken');
    }

    logger.debug('Token refreshed');
    return 'Token refreshed';
  }

  public async enterPin(): Promise<string> {
    if (this.session.accessToken === '') {
      throw 'Token not set';
    }

    try {
      const response = await got(`${this.environment.baseUrl}/api/v1/user/pin`, {
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
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeController.pin');
    }
  }

  public async login(): Promise<string> {
    try {
      // request cookie via got and store it to the cookieJar
      const cookieJar = new CookieJar();
      await got(this.environment.endpoints.session, { cookieJar });
      logger.debug('@EuropeController.login: Initialized the auth session');

      // required by the api to set lang
      await got(this.environment.endpoints.language, { method: 'POST', body: `{"lang":"${this.userConfig.language}"}`, cookieJar });
      logger.debug(`@EuropeController.login: defined the language to ${this.userConfig.language}`);

      const authCodeResponse = await got(this.environment.endpoints.login, {
        method: 'POST',
        json: true,
        body: {
          'email': this.userConfig.username,
          'password': this.userConfig.password,
        },
        cookieJar,
      });

      let authorizationCode;
      if (authCodeResponse) {
        const regexMatch = /code=([^&]*)/g.exec(authCodeResponse.body.redirectUrl);
        if (regexMatch !== null) {
          authorizationCode = regexMatch[1];
        } else {
          throw new Error('@EuropeController.login: AuthCode was not found, you probably need to migrate your account.');
        }
      }
      logger.debug('@EuropeController.login: Authenticated properly with user and password');

      const credentials = await pr.register(this.environment.GCMSenderID);
      const notificationReponse = await got(`${this.environment.baseUrl}/api/v1/spa/notifications/register`, {
        method: 'POST',
        headers: {
          'ccsp-service-id': this.environment.clientId,
          'Content-Type': 'application/json;charset=UTF-8',
          'Host': this.environment.host,
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'okhttp/3.10.0',
          'Stamp': this.environment.stamp(),
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
      logger.debug('@EuropeController.login: Device registered');

      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', this.environment.endpoints.redirectUri);
      formData.append('code', authorizationCode);

      const response = await got(this.environment.endpoints.token, {
        method: 'POST',
        headers: {
          'Authorization': this.environment.basicToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': this.environment.host,
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'okhttp/3.10.0',
          'grant_type': 'authorization_code',
          'Stamp': this.environment.stamp(),
        },
        body: formData.toString(),
        cookieJar,
      });

      if (response.statusCode !== 200) {
        throw new Error(`@EuropeController.login: Could not manage to get token: ${response.body}`);
      }

      if (response) {
        const responseBody = JSON.parse(response.body);
        this.session.accessToken = `Bearer ${responseBody.access_token}`;
        this.session.refreshToken = responseBody.refresh_token;
        this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + responseBody.expires_in);
      }
      logger.debug('@EuropeController.login: Session defined properly');

      return 'Login success';
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeController.login');
    }
  }

  public async logout(): Promise<string> {
    return 'OK';
  }

  public async getVehicles(): Promise<Array<Vehicle>> {
    if (this.session.accessToken === undefined) {
      throw 'Token not set';
    }

    try {
      const response = await got(`${this.environment.baseUrl}/api/v1/spa/vehicles`, {
        method: 'GET',
        headers: {
          'Authorization': this.session.accessToken,
          'ccsp-device-id': this.session.deviceId,
          'Stamp': this.environment.stamp(),
        },
        json: true,
      });
  
      this.vehicles = await asyncMap<EuropeanVehicleDescription, EuropeanVehicle>(response.body.resMsg.vehicles, async v => {
        const vehicleProfileReponse = await got(
          `${this.environment.baseUrl}/api/v1/spa/vehicles/${v.vehicleId}/profile`,
          {
            method: 'GET',
            headers: {
              'Authorization': this.session.accessToken,
              'ccsp-device-id': this.session.deviceId,
              'Stamp': this.environment.stamp(),
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
  
        logger.debug(`@EuropeController.getVehicles: Added vehicle ${vehicleConfig.id}`);
        return new EuropeanVehicle(vehicleConfig, this);
      });
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeController.getVehicles');
    }

    return this.vehicles;
  }
}
