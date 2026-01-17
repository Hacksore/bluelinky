import {
  getBrandEnvironment,
  EuropeanBrandEnvironment,
  DEFAULT_LANGUAGE,
  EULanguages,
  EU_LANGUAGES,
} from './../constants/europe';
import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import got, { GotInstance, GotJSONFn } from 'got';
import { Vehicle } from '../vehicles/vehicle';
import EuropeanVehicle from '../vehicles/european.vehicle';
import { SessionController } from './controller';

import logger from '../logger';
import { URLSearchParams } from 'url';

import { CookieJar } from 'tough-cookie';
import { VehicleRegisterOptions } from '../interfaces/common.interfaces';
import { asyncMap, manageBluelinkyError, Stringifiable, uuidV4 } from '../tools/common.tools';
import { AuthStrategy, Code, Token } from './authStrategies/authStrategy';
import { EuropeanBrandAuthStrategy } from './authStrategies/european.brandAuth.strategy';
import { EuropeanLegacyAuthStrategy } from './authStrategies/european.legacyAuth.strategy';

export interface EuropeBlueLinkyConfig extends BlueLinkyConfig {
  language?: EULanguages;
  region: 'EU';
}

interface EuropeanVehicleDescription {
  nickname: string;
  vehicleName: string;
  regDate: string;
  vehicleId: string;
  ccuCCS2ProtocolSupport: number
}

export class EuropeanController extends SessionController<EuropeBlueLinkyConfig> {
  private _environment: EuropeanBrandEnvironment;
  private authStrategies: {
    main: AuthStrategy;
    fallback: AuthStrategy;
  };
  constructor(userConfig: EuropeBlueLinkyConfig) {
    super(userConfig);
    this.userConfig.language = userConfig.language ?? DEFAULT_LANGUAGE;
    if (!EU_LANGUAGES.includes(this.userConfig.language)) {
      throw new Error(
        `The language code ${this.userConfig.language} is not managed. Only ${EU_LANGUAGES.join(
          ', '
        )} are.`
      );
    }
    this.session.deviceId = uuidV4();
    this._environment = getBrandEnvironment(userConfig);
    this.authStrategies = {
      main: new EuropeanBrandAuthStrategy(this._environment, this.userConfig.language),
      fallback: new EuropeanLegacyAuthStrategy(this._environment, this.userConfig.language),
    };
    logger.debug('EU Controller created');
  }

  public get environment(): EuropeanBrandEnvironment {
    return this._environment;
  }

  public session: Session = {
    accessToken: '',
    refreshToken: '',
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

    try {
      const uri = this.environment.loginFormHost + this.environment.endpoints.tokenURL;

      const	headers = {
        'Content-type': 'application/x-www-form-urlencoded',
        'User-Agent':   'Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19_CCS_APP_AOS',
      };

      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', this.session.refreshToken);
      formData.append('client_id', this.environment.ccspServiceID);
      formData.append('client_secret', this.environment.ccspServiceSecret);

      const response = await got.post(uri, {
        headers: headers,
        body: formData.toString(),
        followRedirect: true,
        throwHttpErrors: false,
      });

      if (response.statusCode !== 200) {
          logger.debug(`Refresh token failed: ${response.body}`);
          return `Refresh token failed: ${response.body}`;
      }

      const token = JSON.parse(response.body);
      if (! token.refresh_token && this.session.refreshToken != '') {
        token.refresh_token = this.session.refreshToken;
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
      this.session.controlTokenExpiresAt = Math.floor(
        Date.now() / 1000 + response.body.expiresTime
      );
      return 'PIN entered OK, The pin is valid for 10 minutes';
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeController.pin');
    }
  }

  public async login(): Promise<string> {
    try {
      if (!this.userConfig.password || !this.userConfig.username) {
        throw new Error('@EuropeController.login: username and password must be defined.');
      }
      let authResult: { code: Code | Token; cookies: CookieJar } | null = null;
      try {
        logger.debug(
          `@EuropeController.login: Trying to sign in with ${this.authStrategies.main.name}`
        );
        authResult = await this.authStrategies.main.login({
          password: this.userConfig.password,
          username: this.userConfig.username,
        });
      } catch (e) {
        logger.error(
          `@EuropeController.login: sign in with ${
            this.authStrategies.main.name
          } failed with error ${(e as Stringifiable).toString()}`
        );

        throw new Error('@EuropeController.login: Could not manage to get token');
      }

      logger.debug('@EuropeController.login: Authenticated properly with user and password');

      const token = authResult.code as Token;
      this.session.accessToken = `Bearer ${token.access_token}`;
      this.session.refreshToken = token.refresh_token;
      this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + token.expires_in);

      const genRanHex = size =>
        [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

      const stamp: string = this.environment.stamp.result as string;

      const data = {
        'pushRegId': genRanHex(64),
        'pushType':  this.environment.pushType,
        'uuid':      crypto.randomUUID(),
      };

      const headers = {
        'ccsp-service-id':     this.environment.ccspServiceID,
        'ccsp-application-id': this.environment.ccspApplicationID,
        'Content-type':        'application/json;charset=UTF-8',
        'User-Agent':          'okhttp/3.10.0',
        'Stamp':               stamp,
      };


      const notificationReponse = await got.post(this.environment.endpoints.deviceIdURL, {
        headers: headers,
        body: data,
        json: true,
      });

      if (notificationReponse) {
        this.session.deviceId = notificationReponse.body.resMsg.deviceId;
      }
      logger.debug('@EuropeController.login: Device registered');
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
          ...this.defaultHeaders,
//        'Stamp': await this.environment.stamp(),
        },
        json: true,
      });

      this.vehicles = await asyncMap<EuropeanVehicleDescription, EuropeanVehicle>(
        response.body.resMsg.vehicles,
        async v => {
          const vehicleProfileReponse = await got(
            `${this.environment.baseUrl}/api/v1/spa/vehicles/${v.vehicleId}/profile`,
            {
              method: 'GET',
              headers: {
                ...this.defaultHeaders,
//              'Stamp': await this.environment.stamp(),
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
            ccuCCS2ProtocolSupport: !!v.ccuCCS2ProtocolSupport
          } as VehicleRegisterOptions;

          logger.debug(`@EuropeController.getVehicles: Added vehicle ${vehicleConfig.id}`);
          return new EuropeanVehicle(vehicleConfig, this);
        }
      );
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeController.getVehicles');
    }

    return this.vehicles;
  }

  private async checkControlToken(): Promise<void> {
    await this.refreshAccessToken();
    if (this.session?.controlTokenExpiresAt !== undefined) {
      if (!this.session.controlToken || Date.now() / 1000 > this.session.controlTokenExpiresAt) {
        await this.enterPin();
      }
    }
  }

  public async getVehicleHttpService(): Promise<GotInstance<GotJSONFn>> {
    await this.checkControlToken();
    return got.extend({
      baseUrl: this.environment.baseUrl,
      headers: {
        ...this.defaultHeaders,
        'Authorization': this.session.controlToken,
//      'Stamp': await this.environment.stamp(),
      },
      json: true,
    });
  }

  public async getApiHttpService(): Promise<GotInstance<GotJSONFn>> {
    await this.refreshAccessToken();
    return got.extend({
      baseUrl: this.environment.baseUrl,
      headers: {
        ...this.defaultHeaders,
//      'Stamp': await this.environment.stamp(),
      },
      json: true,
    });
  }

  private get defaultHeaders() {
    return {
      'Authorization': this.session.accessToken,
      'offset': (new Date().getTimezoneOffset() / 60).toFixed(2),
      'ccsp-device-id': this.session.deviceId,
      'ccsp-application-id': this.environment.ccspApplicationID,
      'Content-Type': 'application/json',
    };
  }
}