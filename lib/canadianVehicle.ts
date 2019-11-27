import BlueLinky from './index';
import EventEmitter from 'events';
import allEndpoints from './endpoints';
import got from 'got';
import { buildFormData } from './util';

import {
  HyundaiResponse,
  CanadaVehicleConfig,
  VehicleStatus
} from './interfaces';

import logger from './logger';

const endpoints = allEndpoints['CA'];

export default class AmericanVehicle extends EventEmitter{
  private vin: string|null;
  private pin: string|null;
  private eventEmitter: EventEmitter;
  private bluelinky: BlueLinky;
  private currentFeatures: object;

  constructor(config: CanadaVehicleConfig) {
    super();
    this.vin = config.vin;
    this.pin = config.pin;
    this.eventEmitter = new EventEmitter();
    this.bluelinky = config.bluelinky;

    this.onInit();
  }

  addFeature(featureName, state) {
    this.currentFeatures[featureName] = (state === 'ON' ? true : false);
  }

  async onInit() {
   
    this.emit('ready');
  }

  async status(refresh: boolean = false): Promise<VehicleStatus|null> {

    const response = await this._request(endpoints.status, {});

    return response.RESPONSE_STRING.vehicleStatus;

  }

  private async _request(endpoint, data): Promise<any|null> {
    logger.debug(`[${endpoint}] ${JSON.stringify(data)}`);

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
