import { CA_ENDPOINTS } from './constants';
import got from 'got';

import BaseVehicle from './baseVehicle';

import {
  VehicleConfig,
  VehicleStatus,
  CanadianEndpoints
} from './interfaces';

import logger from './logger';

export default class CanadianVehicle extends BaseVehicle {
  private endpoints: CanadianEndpoints = CA_ENDPOINTS;

  private vehicleId: number = 0;

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
    const response = await got(this.endpoints.list, {
      method: 'POST',
      headers: {
        from: 'CWP',
        language: '1',
        Host: 'mybluelink.ca',
        Origin: 'https://mybluelink.ca',
        offset: '-5',
        accessToken: token
      },
      json: true
    });
    
    console.log(response.body, null, 2);

    return response.body.result.vehicles;
  }

  async status(): Promise<VehicleStatus|null> {
    logger.info('Begin status request');
    const response = await this._request(this.endpoints.status, {    
    });

    console.log(response.body);
    return null;
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

  private async getPreAuth() {
    const token = this.bluelinky.getAccessToken() || '';
    const response = await got(this.endpoints.verifyPin, {
      method: 'POST',
      headers: {
        from: 'CWP',
        language: '1',
        Host: 'mybluelink.ca',
        Origin: 'https://mybluelink.ca',
        offset: '-5',
        accessToken: token
      },
      json: true,
      body: { pin: this.pin }
    });

    const pAuth = response.body.result.pAuth;
    logger.info('pAuth ' + pAuth);
    return pAuth;
  }

  private async _request(endpoint, data): Promise<any|null> {
    logger.info(`[${endpoint}] ${JSON.stringify(data)}`);

    const response = await got(this.endpoints.login, {
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
        pin: this.pin 
      }
    });

    return response;

  }
}
