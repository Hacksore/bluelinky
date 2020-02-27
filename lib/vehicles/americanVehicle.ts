import { REGIONS } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';

import logger from '../logger';
import { Vehicle } from './vehicle';
import got from 'got';
import { BASE_URL, CLIENT_ID, API_HOST } from '../constants/america';
export default class AmericanVehicle extends Vehicle {
  private _status: VehicleStatus | null = null;
  public region = REGIONS.US;

  constructor(public config, public session) {
    super(session);
    logger.info(`US Vehicle ${this.config.regId} created`);
  }

  get status(): VehicleStatus | null {
    return this._status;
  }
  
  get location(): VehicleLocation | null {
    throw new Error('Method not implemented.');
  }
  get odometer(): Odometer | null {
    throw new Error('Method not implemented.');
  }

  get gen(): string {
    throw new Error('Method not implemented.');
  }

  get vin(): string {
    return this.config.vin;
  }

  startClimate(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  stopClimate(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  updateStatus(): Promise<VehicleStatus> {
    throw new Error('Method not implemented.');
  }

  get name(): string {
    return this.config.nickname;
  }

  get vinNumber(): string {
    return '';
  }

  get type(): string {
    return this.type;
  }

  public async getStatus(): Promise<VehicleStatus> {

    // TODO: figure out all the things needed here for headers    
    const response = await got(`${BASE_URL}/ac/v2/rcs/rvs/vehicleStatus`, {
      method: 'GET',
      headers: {
        'access_token': this.session.accessToken,
        'Client_Id': CLIENT_ID,
        'Host': API_HOST,
        'User-Agent': 'okhttp/3.12.0',
        'registrationId': this.config.regId,
        'VIN': this.config.vin,
        'Language': '0',
        'To': 'ISS',
        'From': 'SPA',
        'refresh': 'false',
        'brandIndecator': this.config.brandIndecator,
        'Offset': '-5'
      }
    });

    const data = JSON.parse(response.body);
    return Promise.resolve(data as VehicleStatus);
  }

  public async unlock(): Promise<string> {
    console.log('TODO');
    return Promise.reject();
  }

  public async lock(): Promise<string> {
    console.log('TODO');
    return Promise.reject();
  }
}
