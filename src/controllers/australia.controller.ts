import got, { GotInstance, GotJSONFn } from 'got';
import AustraliaVehicle from '../vehicles/australia.vehicle';
import { Vehicle } from '../vehicles/vehicle';
import { AustraliaBrandEnvironment, getBrandEnvironment } from './../constants/australia';
import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import { SessionController } from './controller';

import { URLSearchParams } from 'url';
import logger from '../logger';

import { CookieJar } from 'tough-cookie';
import { VehicleRegisterOptions } from '../interfaces/common.interfaces';
import { asyncMap, manageBluelinkyError, Stringifiable, uuidV4 } from '../tools/common.tools';
import { AustraliaAuthStrategy } from './authStrategies/australia.authStrategy';
import { Code } from './authStrategies/authStrategy';
import { StampMode } from '../constants/stamps';

export interface AustraliaBlueLinkyConfig extends BlueLinkyConfig {
  region: 'AU';
  stampMode?: StampMode;
  stampsFile?: string;
}

interface AustraliaVehicleDescription {
  nickname: string;
  vehicleName: string;
  regDate: string;
  vehicleId: string;
}

export class AustraliaController extends SessionController<AustraliaBlueLinkyConfig> {
  private _environment: AustraliaBrandEnvironment;
  private authStrategy: AustraliaAuthStrategy;
  constructor(userConfig: AustraliaBlueLinkyConfig) {
    super(userConfig);
    this.session.deviceId = uuidV4();
    this._environment = getBrandEnvironment(userConfig);
    this.authStrategy = new AustraliaAuthStrategy(this._environment);
    logger.debug('AU Controller created');
  }

  public get environment(): AustraliaBrandEnvironment {
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

  private vehicles: Array<AustraliaVehicle> = [];

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
      throw manageBluelinkyError(err, 'AustraliaController.refreshAccessToken');
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
      throw manageBluelinkyError(err, 'AustraliaController.pin');
    }
  }

  public async login(): Promise<string> {
    try {
      if (!this.userConfig.password || !this.userConfig.username) {
        throw new Error('@AustraliaController.login: username and password must be defined.');
      }
      let authResult: { code: Code; cookies: CookieJar } | null = null;
      try {
        logger.debug(
          `@AustraliaController.login: Trying to sign in with ${this.authStrategy.name}`
        );
        authResult = await this.authStrategy.login({
          password: this.userConfig.password,
          username: this.userConfig.username,
        });
      } catch (e) {
        throw new Error(
          `@AustraliaController.login: sign in with ${this.authStrategy.name} failed with error ${(
            e as Stringifiable
          ).toString()}`
        );
      }
      logger.debug('@AustraliaController.login: Authenticated properly with user and password');
      const genRanHex = size =>
        [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const notificationReponse = await got(
        `${this.environment.baseUrl}/api/v1/spa/notifications/register`,
        {
          method: 'POST',
          headers: {
            'ccsp-service-id': this.environment.clientId,
            'Content-Type': 'application/json;charset=UTF-8',
            'Host': this.environment.host,
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'User-Agent': 'okhttp/3.10.0',
            'ccsp-application-id': this.environment.appId,
            'Stamp': await this.environment.stamp(),
          },
          body: {
            pushRegId: genRanHex(64),
            pushType: 'GCM',
            uuid: this.session.deviceId,
          },
          json: true,
        }
      );

      if (notificationReponse) {
        this.session.deviceId = notificationReponse.body.resMsg.deviceId;
      }
      logger.debug('@AustraliaController.login: Device registered');

      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', this.environment.endpoints.redirectUri);
      formData.append('code', authResult.code);

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
          'ccsp-application-id': this.environment.appId,
          'Stamp': await this.environment.stamp(),
        },
        body: formData.toString(),
        cookieJar: authResult.cookies,
      });

      if (response.statusCode !== 200) {
        throw new Error(
          `@AustraliaController.login: Could not manage to get token: ${response.body}`
        );
      }

      if (response) {
        const responseBody = JSON.parse(response.body);
        this.session.accessToken = `Bearer ${responseBody.access_token}`;
        this.session.refreshToken = responseBody.refresh_token;
        this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + responseBody.expires_in);
      }
      logger.debug('@AustraliaController.login: Session defined properly');

      return 'Login success';
    } catch (err) {
      throw manageBluelinkyError(err, 'AustraliaController.login');
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
          'Stamp': await this.environment.stamp(),
        },
        json: true,
      });

      this.vehicles = await asyncMap<AustraliaVehicleDescription, AustraliaVehicle>(
        response.body.resMsg.vehicles,
        async v => {
          const vehicleProfileReponse = await got(
            `${this.environment.baseUrl}/api/v1/spa/vehicles/${v.vehicleId}/profile`,
            {
              method: 'GET',
              headers: {
                ...this.defaultHeaders,
                'Stamp': await this.environment.stamp(),
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

          logger.debug(`@AustraliaController.getVehicles: Added vehicle ${vehicleConfig.id}`);
          return new AustraliaVehicle(vehicleConfig, this);
        }
      );
    } catch (err) {
      throw manageBluelinkyError(err, 'AustraliaController.getVehicles');
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
        'Stamp': await this.environment.stamp(),
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
        'Stamp': await this.environment.stamp(),
      },
      json: true,
    });
  }

  private get defaultHeaders() {
    return {
      'Authorization': this.session.accessToken,
      'offset': (new Date().getTimezoneOffset() / 60).toFixed(2),
      'ccsp-device-id': this.session.deviceId,
      'ccsp-application-id': this.environment.appId,
      'Content-Type': 'application/json',
    };
  }
}
