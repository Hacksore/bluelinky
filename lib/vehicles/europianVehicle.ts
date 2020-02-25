import { REGIONS, EU_ENDPOINTS, EU_BASE_URL } from '../constants';
import got from 'got';

import logger from '../logger';
import { Vehicle } from './vehicle';

export default class EuropeanVehicle extends Vehicle {

  get name(): string {
    return this.config.nickname;
  }

  get vinNumber(): string {
    return '';
  }

  get type(): string {
    return this.type;
  }

  public region = REGIONS.EU;

  constructor(
    public config,
    public session
  ) {
    super(session);
    this.onInit();
  }

  async onInit() {
    logger.info(`EU Vehicle ${this.config.vehicleId} created`);
  }

  public async getStatus() {
    // TODO:
  }

  public async unlock(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.session.controlToken === '') {
        return reject('Token not set');
      }

      const response = await got(
        `${EU_BASE_URL}/api/v2/spa/vehicles/${this.config.vehicleId}/control/door`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.session.controlToken,
            'ccsp-device-id': this.session.deviceId,
          },
          body: {
            action: 'open',
            deviceId: this.session.deviceId,
          },
          json: true,
        }
      );
      resolve('Unlock OK');

    });
  }

  public async lock(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.session.controlToken === '') {
        return reject('Token not set');
      }

      const response = await got(
        `${EU_BASE_URL}/api/v2/spa/vehicles/${this.config.vehicleId}/control/door`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.session.controlToken,
            'ccsp-device-id': this.session.deviceId,
          },
          body: {
            action: 'close',
            deviceId: this.session.deviceId,
          },
          json: true,
        }
      );
      resolve('Lock OK');
    });
  }
}
