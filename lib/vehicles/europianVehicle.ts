import { EU_ENDPOINTS } from '../constants';
import got from 'got';

import {
  EuropeanEndpoints
} from '../interfaces/european.interfaces';

import logger from '../logger';

export default class EuropeanVehicle {
  private endpoints: EuropeanEndpoints = EU_ENDPOINTS;

  constructor(
    private master: boolean,
    private nickname: string,
    private regDate: string,
    private type: string,
    private vehicleId: string,
    private vehicleName: string) {
    this.onInit();
  }

  async onInit() {
    logger.info(`EU Vehicle ${this.vehicleId} created`);
  }

  public async getStatus(){

  }

  public async unlock(){

  }

  public async lock(){
    
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
