import got from 'got';
import { endpoints } from './constants';
import Vehicle from './vehicle';
import { buildFormData } from './util';

import {
  AuthConfig,
  TokenResponse,
} from './interfaces';

import logger from './logger';
class BlueLinky {

  private authConfig: AuthConfig = {
    username: null,
    password: null
  };

  private accessToken: string|null = null;
  private tokenExpires: number = 0;
  private vehicles: Array<Vehicle> = [];

  constructor(authConfig: AuthConfig) {
    this.authConfig = authConfig;
  }

  async login(): Promise<object> {
    const response = await this.getToken();
    const currentTime = Math.floor(+new Date()/1000);
    const expires = Math.floor(currentTime + parseInt(response.expires_in, 10));

    logger.info(`Logged in to bluelink, token expires at ${expires}`);
    logger.info(`Current time: ${currentTime}`);
    this.accessToken = response.access_token;
    this.tokenExpires = expires;

    return response;
  }

  getAccessToken(): string|null {
    return this.accessToken;
  }

  setAccessToken(token: string|null) {
    this.accessToken = token;
  }

  setTokenExpires(unixtime: number) {
    this.tokenExpires = unixtime;
  }

  getTokenExpires(): number {
    return this.tokenExpires || 0;
  }

  get username(): string|null {
    return this.authConfig.username;
  }

  getVehicles() {
    return this.vehicles;
  }

  getVehicle(vin: string): Vehicle|undefined {
    return this.vehicles.find(item => vin === item.getVinNumber());
  }

  registerVehicle(vin: string, pin: string): Promise<Vehicle|null> {

    if(!this.getVehicle(vin)) {
      const vehicle = new Vehicle({
        vin: vin,
        pin: pin,
        token: this.accessToken,
        bluelinky: this
      });

      this.vehicles.push(vehicle);

      return new Promise((resolve, reject) => {
        vehicle.on('ready', () => resolve(vehicle));
      });
    }

    return Promise.resolve(null);
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
}

export default BlueLinky;
