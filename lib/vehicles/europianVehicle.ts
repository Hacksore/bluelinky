import { EU_ENDPOINTS } from '../constants';
import got from 'got';

import {
  EuropeanEndpoints
} from '../interfaces/european.interfaces';

import logger from '../logger';
import { Vehicle } from './vehicle';

export default class EuropeanVehicle extends Vehicle {

  get Name(): string {
    return this.nickname;
  }

  get VIN(): string {
    return '';
  }

  get Type(): string {
    return this.type;
  }

  private endpoints: EuropeanEndpoints = EU_ENDPOINTS;
  public region = 'EU';


  constructor(
    public master: boolean,
    public nickname: string,
    public regDate: string,
    public type: string,
    public vehicleId: string,
    public vehicleName: string) {
    super();
    this.onInit();
  }

  async onInit() {
    logger.info(`EU Vehicle ${this.vehicleId} created`);
  }

  public async getStatus(){

  }

  public async Unlock(): Promise<string> {
    return Promise.resolve('OK');
  }

  public async Lock(): Promise<string> {
    return Promise.resolve('OK');
  }

  // private async _request(endpoint, data): Promise<any|null> {
  //   logger.info(`[${endpoint}] ${JSON.stringify(data)}`);

  //   const response = await got(endpoint, {
  //     method: 'POST',
  //     json: true,
  //     headers: {
  //       ...data
  //     },
  //     body: {
  //       pin: this.pin,
  //     }
  //   });

  //   return response;
  // }
}
