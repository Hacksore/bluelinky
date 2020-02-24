import { EU_ENDPOINTS } from '../constants';
import got from 'got';

import {
  EuropeanEndpoints
} from '../interfaces/european.interfaces';

import logger from '../logger';
import BaseVehicle from '../baseVehicle';

export default class EuropeanVehicle extends BaseVehicle {
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
