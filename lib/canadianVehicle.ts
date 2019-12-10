import { CA_ENDPOINTS } from './constants';
import got from 'got';

import BaseVehicle from './baseVehicle';

import {
  StartConfig,
  VehicleConfig,
  VehicleStatus,
  CanadianEndpoints
} from './interfaces';

import logger from './logger';

export default class CanadianVehicle extends BaseVehicle {
  private endpoints: CanadianEndpoints = CA_ENDPOINTS;

  private vehicleId: string = '';

  constructor(config: VehicleConfig) {
    super(config);
    this.vin = config.vin;
    this.pin = config.pin;
    this.bluelinky = config.bluelinky;
    this.auth.accessToken = config.token;

    this.onInit();
  }

  async onInit() {
    logger.info('onInit from CA');

    // get list of vehicles and find the vehicle id
    const vehicles = await this.getVehicleList();
    const foundVehicle = vehicles.find(car => car.vin === this.vin);

    console.log('Found vehicle:', foundVehicle.vehicleId);
    this.vehicleId = foundVehicle.vehicleId;

    this.emit('ready');
  }

  async getVehicleList(): Promise<any> { // TODO: type this
    console.log('getVehicleList');

    const token = this.bluelinky.getAccessToken() || '';
    const response = await this._request(this.endpoints.list, {});

    console.log(JSON.stringify(response.body, null, 2));

    return response.body.result.vehicles;
  }

  async lock(): Promise<any> {
    logger.info('Begin lock request');

    // get pAuth header
    const preAuth = await this.getPreAuth();

    // do lock request
    const response = await this._request(this.endpoints.lock, {
      pAuth: preAuth
    });

    console.log(response.body);
    return null;
  }

  async unlock(): Promise<any> {
    logger.info('Begin lock request');

    // get pAuth header
    const preAuth = await this.getPreAuth();

    // do lock request
    const response = await this._request(this.endpoints.unlock, {
      pAuth: preAuth
    });

    console.log(response.body);
    return null;
  }

  async start(config: StartConfig): Promise<any> {
    logger.info('Begin start request');

    // get pAuth header
    const preAuth = await this.getPreAuth();

    // do lock request
    const response = await this._request(this.endpoints.start, {
      pAuth: preAuth,
      ...config
    });

    console.log(response.body);
    return null;
  }

  async stop(): Promise<any> {
    logger.info('Begin stop request');

    // get pAuth header
    const preAuth = await this.getPreAuth();

    // do lock request
    const response = await this._request(this.endpoints.stop, {
      pAuth: preAuth
    });

    console.log(response.body);
    return null;
  }

  async myAccount(): Promise<any> {
    logger.info('Begin myAccount request');
​   const response = await this._request(this.endpoints.myAccount, {});
​   console.log(response.body);
    return null;
  }

  async vehiculeInfo(): Promise<any> {
    logger.info('Begin vehiculeInfo request');
​   const response = await this._request(this.endpoints.vehiculeInfo, {});
​   console.log(response.body);
    return null;
  }

  async nextService(): Promise<any> {
    logger.info('Begin nextService request');
​   const response = await this._request(this.endpoints.nextService, {});
​   console.log(response.body);
    return null;
  }

  async preferedDealer(): Promise<any> {
    logger.info('Begin preferedDealer request');
​   const response = await this._request(this.endpoints.preferedDealer, {});
​   console.log(response.body);
    return null;
  }

  async status(refresh = false): Promise<VehicleStatus|null> {
    logger.info('Begin status request');
    const endpoint = refresh ? this.endpoints.remoteStatus : this.endpoints.status;
    const response = await this._request(endpoint, {});
    console.log(response.body);
    return null;
  }
​
  private async getPreAuth() {
    const response = await this._request(this.endpoints.verifyPin, {});

    const pAuth = response.body.result.pAuth;
    logger.info('pAuth ' + pAuth);
    return pAuth;
  }

  private async _request(endpoint, data): Promise<any|null> {
    logger.info(`[${endpoint}] ${JSON.stringify(data)}`);

    const response = await got(endpoint, {
      method: 'POST',
      json: true,
      headers: {
        pin: this.pin,
        from: 'CWP',
        language: '1',
        Host: 'mybluelink.ca',
        Origin: 'https://mybluelink.ca',
        offset: '-5',
        accessToken: this.bluelinky.getAccessToken(),
        vehicleId: this.vehicleId,
        ...data
      },
      body: {
        pin: this.pin,
      }
    });

    return response;

  }
}
