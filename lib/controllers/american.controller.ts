import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import got from 'got';
import { ALL_ENDPOINTS, REGIONS } from '../constants';
import { Vehicle } from '../vehicles/vehicle';
import SessionController from './controller';

import logger from '../logger';
// import { URLSearchParams } from 'url';

export class AmericanController extends SessionController {
  private vehicles: Array<Vehicle> = [];
  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: REGIONS.US,
    autoLogin: true,
    pin: null,
    deviceUuid: null
  };

  constructor(config: BlueLinkyConfig) {
    super();
    this.config = config;
    logger.info(`${this.config.region} Controller created`);
  }

  session: Session = {
    accessToken: '',
    controlToken: '',
    deviceId: '',
  };

  async login() {
    return new Promise<string>(async (resolve, reject) => {
      // pasta code here

    });
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  getVehicles(): Promise<Array<Vehicle>> {
    throw new Error('Method not implemented.');
  }
  enterPin(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  // async getVehicles(): Promise<Array<Vehicle>|null> {
  //   // soon tm
  // }
}
