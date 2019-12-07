import got from 'got';
import allEndpoints from './endpoints';
import AmericanVehicle from './americanVehicle';
import CanadianVehicle from './canadianVehicle';

import {
  AuthConfig,
  TokenResponse,
  RegisterVehicleConfig,
} from './interfaces';

import { buildFormData } from './util';

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

  async getToken(): Promise<TokenResponse> {
    let response: got.Response<any|null>;
    const endpoints = allEndpoints['US'];

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
      logger.info(`starting login specifc for US`);
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
      logger.info(`starting login specifc for CA`);
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
      }
      else if (this.region === 'CA') {
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
      logger.info('created new vehicle')

      this.vehicles.push(vehicle);

      return new Promise((resolve, reject) => {
        logger.info('start promise');
        vehicle.on('ready', () => { 
          logger.info('fin promise');
          resolve(vehicle)
        });
      });
    }

    return Promise.resolve(null);
  }

}

export default BlueLinky;
