import got from 'got';
import AmericanVehicle from './americanVehicle';
import CanadianVehicle from './canadianVehicle';
import { ALL_ENDPOINTS } from './constants';
import { buildFormData } from './util';

import {
  AuthConfig,
  TokenResponse,
  RegisterVehicleConfig,
} from './interfaces';

import logger from './logger';

class BlueLinky {

  public authConfig: AuthConfig = {
    username: null,
    password: null
  };
  public region: string|null = null;

  private accessToken: string|null = null;
  private tokenExpires: number = 0;

  private vehicles: Array<CanadianVehicle|AmericanVehicle> = [];

  constructor(authConfig: AuthConfig) {
    this.authConfig = authConfig;
  }

  setAccessToken(token: string|null) {
    this.accessToken = token;
  }

  getAccessToken(): string|null {
    return this.accessToken;
  }

  setTokenExpires(unixtime: number) {
    this.tokenExpires = unixtime;
  }

  // We should fetch a new token if we have elapsed the max time
  async handleTokenRefresh() {
    logger.debug('token time: ' + this.tokenExpires);
    const currentTime = Math.floor((+new Date()/1000));
    const tokenDelta = -(currentTime - (this.tokenExpires));

    // Refresh 60 seconds before timeout just for good measure
    if (tokenDelta <= 60) {
      logger.info('Token is about to expire, refreshing access token 60 seconds early');
      const result = await this.getToken();
      this.setAccessToken(result.access_token);
      logger.debug(`Token is refreshed ${JSON.stringify(result)}`);
    } else {
      logger.debug(`Token is still valid: ${tokenDelta}`);
    }
  }

  async getToken(): Promise<TokenResponse> {
    let response: got.Response<any|null>;
    const endpoints = ALL_ENDPOINTS.US;

    const now = Math.floor(+new Date() / 1000);
    response = await got(endpoints.getToken + now, {
      method: 'GET',
      json: true
    });

    const csrfToken = response.body.token;
    logger.debug(`Fetching CSRF Token ${csrfToken}`);

    response = await got(endpoints.validateToken, {
      method: 'GET',
      headers: {
        Cookie: `csrf_token=${csrfToken};`
      }
    });

    const formData = buildFormData({
      ':cq_csrf_token': csrfToken,
      'username': this.authConfig.username,
      'password': this.authConfig.password,
      'url': 'https://owners.hyundaiusa.com/us/en/index.html'
    });

    response = await got(endpoints.auth, {
      method: 'POST',
      body: formData
    });

    try {
      const json = JSON.parse(response.body);
      logger.debug(`Fetching JSON Auth Token, RESPONSE: ${JSON.stringify(json)}`);

      return json.Token;
    } catch {
      throw new Error(response.body);
    }
  }

  async login(config: any): Promise<object> {
    const { region } = config;
    this.region = region;
    logger.info(`starting login method [${region}]`);
    // if region is US do this
    if (region === 'US') {
      const response = await this.getToken();
      const currentTime = Math.floor(+new Date()/1000);
      const expires = Math.floor(currentTime + parseInt(response.expires_in, 10));

      logger.info(`Logged in to bluelink, token expires at ${expires}`);
      logger.info(`Current time: ${currentTime}`);
      this.accessToken = response.access_token;
      this.tokenExpires = expires;
      return response;
    }

    // if region is CA do this
    if (region === 'CA') {

      try {
        const response = await got('https://mybluelink.ca/tods/api/lgn', {
          method: 'POST',
          headers: {
            from: 'CWP',
            language: '1',
            Host: 'mybluelink.ca',
            Origin: 'https://mybluelink.ca',
            offset: '-5',
          },
          json: true,
          body: {
            loginId: this.authConfig.username,
            password: this.authConfig.password
          }
        });

        this.accessToken = response.body.result.accessToken;
        console.log(response.body);
      } catch (err) {
        console.log(err.message);
        return Promise.reject(err.message);
      }

    }

    return Promise.resolve({});
  }

  getVehicles() {
    return this.vehicles;
  }

  getVehicle(vin: string): CanadianVehicle|AmericanVehicle|undefined {
    return this.vehicles.find(item => vin === item.getVinNumber());
  }

  registerVehicle(config: RegisterVehicleConfig): Promise<CanadianVehicle|AmericanVehicle|null> {
    const { vin, pin } = config;

    if (this.accessToken === null) {
      return Promise.reject('access token not fetched, try again');
    }

    logger.info(`reg veh: ${vin}, ${pin}`);
    if(!this.getVehicle(vin)) {
      let vehicle;

      if (this.region === 'US') {
        vehicle = new AmericanVehicle({
          vin: vin,
          pin: pin,
          token: this.accessToken,
          bluelinky: this
        });
      } else if (this.region === 'CA') {
        vehicle = new CanadianVehicle({
          vin: vin,
          pin: pin,
          token: this.accessToken,
          bluelinky: this
        });
      }

      if (!vehicle) {
        return Promise.reject(null);
      }
      logger.info('created new vehicle');

      this.vehicles.push(vehicle);

      return new Promise((resolve, reject) => {
        vehicle.on('ready', () => {
          resolve(vehicle);
        });
      });
    }

    return Promise.resolve(null);
  }

}

export default BlueLinky;
