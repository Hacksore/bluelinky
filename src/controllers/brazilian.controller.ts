import got, { GotInstance, GotJSONFn } from 'got';
import { CookieJar } from 'tough-cookie';
import { URLSearchParams } from 'url';
import { BrazilBrandEnvironment, getBrandEnvironment } from '../constants/brazil';
import { BlueLinkyConfig, Session, VehicleRegisterOptions } from '../interfaces/common.interfaces';
import logger from '../logger';
import { asyncMap, manageBluelinkyError, uuidV4 } from '../tools/common.tools';
import BrazilianVehicle from '../vehicles/brazilian.vehicle';
import { Vehicle } from '../vehicles/vehicle';
import { SessionController } from './controller';

export interface BrazilianBlueLinkyConfig extends BlueLinkyConfig {
  region: 'BR';
}

interface BrazilianVehicleDescription {
  nickname: string;
  vehicleName: string;
  regDate: string;
  vehicleId: string;
}

export class BrazilianController extends SessionController<BrazilianBlueLinkyConfig> {
  private _environment: BrazilBrandEnvironment;

  public session: Session = {
    accessToken: undefined,
    refreshToken: undefined,
    controlToken: undefined,
    deviceId: uuidV4(),
    tokenExpiresAt: 0,
    controlTokenExpiresAt: 0,
  };

  private vehicles: Array<BrazilianVehicle> = [];

  constructor(userConfig: BrazilianBlueLinkyConfig) {
    super(userConfig);
    this._environment = getBrandEnvironment(userConfig.brand);
    logger.debug('BR Controller created');
  }

  public get environment(): BrazilBrandEnvironment {
    return this._environment;
  }

  private get defaultHeaders() {
    return {
      'ccsp-device-id': this.session.deviceId,
      'ccsp-application-id': this.environment.appId,
      'ccsp-service-id': this.environment.clientId,
      'User-Agent':
        'BR_BlueLink/1.0.14 (com.hyundai.bluelink.br; build:10132; iOS 26.5.0) Alamofire/5.9.1',
      'Content-Type': 'application/json; charset=UTF-8',
      'Offset': (new Date().getTimezoneOffset() / 60).toFixed(2),
    };
  }

  public async login(): Promise<string> {
    try {
      if (!this.userConfig.password || !this.userConfig.username) {
        throw new Error('@BrazilController.login: username and password must be defined.');
      }

      // 1. Register device for push notifications to get deviceId
      const genRanHex = (size: number) =>
        [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

      const notificationResponse = await got(
        `${this.environment.baseUrl}/api/v1/spa/notifications/register`,
        {
          method: 'POST',
          headers: {
            'ccsp-service-id': this.environment.clientId,
            'ccsp-application-id': this.environment.appId,
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': this.defaultHeaders['User-Agent'],
          },
          body: JSON.stringify({
            pushRegId: genRanHex(64),
            pushType: 'APNS',
            uuid: this.session.deviceId,
          }),
        }
      );

      if (notificationResponse.statusCode === 200) {
        const notifBody = JSON.parse(notificationResponse.body);
        if (notifBody.resMsg?.deviceId) {
          this.session.deviceId = notifBody.resMsg.deviceId;
        }
      }

      const cookieJar = new CookieJar();
      const webUserAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148_CCS_APP_iOS';

      // 2. Initialize session to get cookies
      await got(this.environment.endpoints.session, {
        method: 'GET',
        headers: { 'User-Agent': webUserAgent },
        cookieJar,
      });

      // 3. Sign In to get authorization code
      const signinResponse = await got(this.environment.endpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'User-Agent': webUserAgent,
        },
        body: JSON.stringify({
          email: this.userConfig.username,
          password: this.userConfig.password,
          mobileNum: '',
        }),
        cookieJar,
      });

      const signinBody = JSON.parse(signinResponse.body);
      if (signinResponse.statusCode !== 200 || !signinBody.redirectUrl) {
        throw new Error(`Login failed: ${signinResponse.body}`);
      }

      const redirectUrl = signinBody.redirectUrl;
      const parsedUrl = new URL(redirectUrl);
      const code = parsedUrl.searchParams.get('code');

      if (!code) {
        throw new Error('Code not found in redirect URL');
      }

      // 4. Exchange code for tokens
      const tokenFormData = new URLSearchParams();
      tokenFormData.append('grant_type', 'authorization_code');
      tokenFormData.append('code', code);
      tokenFormData.append('redirect_uri', this.environment.endpoints.redirectUri);
      tokenFormData.append('client_id', this.environment.clientId);

      const tokenResponse = await got(this.environment.endpoints.token, {
        method: 'POST',
        headers: {
          'Authorization': this.environment.basicToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'User-Agent': this.defaultHeaders['User-Agent'],
        },
        body: tokenFormData.toString(),
        throwHttpErrors: false,
        cookieJar,
      });

      if (tokenResponse.statusCode !== 200) {
        throw new Error(`Token exchange failed: ${tokenResponse.body}`);
      }

      const tokenBody = JSON.parse(tokenResponse.body);
      this.session.accessToken = `Bearer ${tokenBody.access_token}`;
      this.session.refreshToken = tokenBody.refresh_token;
      this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + tokenBody.expires_in);

      logger.debug('@BrazilController.login: Session defined properly');
      return 'Login success';
    } catch (err) {
      throw manageBluelinkyError(err, 'BrazilController.login');
    }
  }

  public async refreshAccessToken(): Promise<string> {
    const shouldRefreshToken = Math.floor(Date.now() / 1000 - this.session.tokenExpiresAt) >= -10;

    if (!this.session.refreshToken) {
      return 'Need refresh token to refresh access token. Use login()';
    }

    if (!shouldRefreshToken) {
      return 'Token not expired, no need to refresh';
    }

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('redirect_uri', 'https://br-ccapi.hyundai.com.br/api/v1/user/oauth2/redirect');
    formData.append('refresh_token', this.session.refreshToken);

    try {
      const response = await got(`${this.environment.baseUrl}/api/v1/user/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': this.environment.basicToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.defaultHeaders['User-Agent'],
        },
        body: formData.toString(),
        throwHttpErrors: false,
      });

      if (response.statusCode !== 200) {
        return `Refresh token failed: ${response.body}`;
      }

      const responseBody = JSON.parse(response.body);
      this.session.accessToken = 'Bearer ' + responseBody.access_token;
      this.session.tokenExpiresAt = Math.floor(Date.now() / 1000 + responseBody.expires_in);
    } catch (err) {
      throw manageBluelinkyError(err, 'BrazilController.refreshAccessToken');
    }

    return 'Token refreshed';
  }

  public async enterPin(): Promise<string> {
    if (!this.session.accessToken) {
      throw 'Token not set';
    }

    try {
      const response = await got(`${this.environment.baseUrl}/api/v1/user/pin`, {
        method: 'PUT',
        headers: {
          ...this.defaultHeaders,
          'Authorization': this.session.accessToken,
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
      return 'PIN entered OK';
    } catch (err) {
      throw manageBluelinkyError(err, 'BrazilController.enterPin');
    }
  }

  public async getVehicles(): Promise<Array<Vehicle>> {
    if (!this.session.accessToken) {
      throw 'Token not set';
    }

    try {
      const response = await got(`${this.environment.baseUrl}/api/v1/spa/vehicles`, {
        method: 'GET',
        headers: {
          ...this.defaultHeaders,
          'Authorization': this.session.accessToken,
        },
        json: true,
      });

      this.vehicles = await asyncMap<BrazilianVehicleDescription, BrazilianVehicle>(
        response.body.resMsg.vehicles,
        async v => {
          const vehicleProfileReponse = await got(
            `${this.environment.baseUrl}/api/v1/spa/vehicles/${v.vehicleId}/profile`,
            {
              method: 'GET',
              headers: {
                ...this.defaultHeaders,
                'Authorization': this.session.accessToken,
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

          return new BrazilianVehicle(vehicleConfig, this);
        }
      );
    } catch (err) {
      throw manageBluelinkyError(err, 'BrazilController.getVehicles');
    }

    return this.vehicles;
  }

  public async logout(): Promise<string> {
    return 'OK';
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
        'Authorization': this.session.accessToken,
      },
      json: true,
    });
  }
}
