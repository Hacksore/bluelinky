import { EU_ENDPOINTS } from '../constants';
import got from 'got';

import BaseVehicle from '../baseVehicle';

import {
  StartConfig,
  VehicleConfig,
  VehicleStatus,
  EuropianEndpoints
} from '../interfaces';

import logger from '../logger';

export default class EuropianVehicle extends BaseVehicle {
  private endpoints: EuropianEndpoints = EU_ENDPOINTS;

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
    logger.info('onInit from EU');

    this.emit('ready');
  }

  private async _request(endpoint, data): Promise<any|null> {
    logger.info(`[${endpoint}] ${JSON.stringify(data)}`);

    const response = await got(endpoint, {
      method: 'POST',
      json: true,
      headers: {
        ...data
      },
      body: {
        pin: this.pin,
      }
    });

    return response;
  }
}
