import BlueLinky from './index';
import EventEmitter from 'events';
import { ALL_ENDPOINTS } from './constants';
import got from 'got';

import BaseVehicle from './baseVehicle';

import {
  VehicleConfig,
  VehicleStatus,
  CanadianEndpoints
} from './interfaces';

import logger from './logger';

export default class CanadianVehicle extends BaseVehicle {
  private endpoints: CanadianEndpoints = ALL_ENDPOINTS.CA;

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

    // TODO: async stuff

    this.emit('ready');
  }

  async status(refresh: boolean = false): Promise<VehicleStatus|null> {
    logger.info('in status method');
    const response = await this._request(this.endpoints.status, {});

    console.log(response.body);

    return null;

  }

  private async _request(endpoint, data): Promise<any|null> {
    logger.info(`[${endpoint}] ${JSON.stringify(data)}`);

    const response = await got(endpoint, {
      method: 'POST',
      json: true,
      body: {
        pin: this.pin
      },
    });

    return response;

  }
}
