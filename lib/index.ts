import got from 'got';
import AmericanVehicle from './vehicles/americanVehicle';
import CanadianVehicle from './vehicles/canadianVehicle';
import EuropianVehicle from './vehicles/europianVehicle';
import { ALL_ENDPOINTS, REGIONS } from './constants';
import { buildFormData } from './util';
import { EventEmitter } from 'events';

import {
  BlueLinkyConfig,
  TokenResponse,
  RegisterVehicleConfig,
} from './interfaces';

import logger from './logger';
import BaseVehicle from './baseVehicle';

class BlueLinky extends EventEmitter {

  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: null
  };

  public region: string|null = null;
  private accessToken: string|null = null;
  private tokenExpires: number = 0;
  private vehicles: Array<CanadianVehicle|AmericanVehicle> = [];

  constructor(config: BlueLinkyConfig) {
    super();
    this.config = config;

    // do login for token here
    this.login();

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
      'username': this.config.username,
      'password': this.config.password,
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

  async login(): Promise<object> {
    const { region } = this.config;
    logger.info(`starting login method [${region}]`);
    // if region is US do this
    if (region === REGIONS.US) {
      const response = await this.getToken();
      const currentTime = Math.floor(+new Date()/1000);
      const expires = Math.floor(currentTime + parseInt(response.expires_in, 10));

      logger.info(`Logged in to bluelink, token expires at ${expires}`);
      logger.info(`Current time: ${currentTime}`);
      this.accessToken = response.access_token;
      this.tokenExpires = expires;
      // return response;
    }

    // if region is CA do this
    if (region === REGIONS.CA) {

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
            loginId: this.config.username,
            password: this.config.password
          }
        });

        this.accessToken = response.body.result.accessToken;
        logger.debug(JSON.stringify(response.body));
      } catch (err) {
        logger.debug(JSON.stringify(err.message));
        Promise.reject(err.message);
      }

    }

    this.emit('ready');
    return Promise.resolve({});
  }

  getVehicles() {
    return this.vehicles;
  }

  getVehicle(vin: string): BaseVehicle|undefined {
    return this.vehicles.find(item => vin === item.getVinNumber());
  }

  registerVehicle(config: RegisterVehicleConfig): Promise<CanadianVehicle|AmericanVehicle|null> {
    const { vin, pin } = config;

    if (this.accessToken === null) {
      return Promise.reject('access token not fetched, try again');
    }

    logger.debug(`registering vehicle: ${vin}, ${pin}`);

    if(!this.getVehicle(vin)) {
      let vehicle;

      const vehicleConfig = {
        vin: vin,
        pin: pin,
        token: this.accessToken,
        bluelinky: this
      };

      switch(this.config.region) {
        case REGIONS.US:
          vehicle = new AmericanVehicle(vehicleConfig);
          break;
        case REGIONS.CA:
          vehicle = new CanadianVehicle(vehicleConfig);
          break;
        case REGIONS.EU:
          vehicle = new EuropianVehicle(vehicleConfig);
          break;
      }

      if (!vehicle) {
        return Promise.reject(null);
      }
      logger.debug('created new vehicle');

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
