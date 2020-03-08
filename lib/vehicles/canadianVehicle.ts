import got from 'got';
import { REGIONS } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';
import { ALL_ENDPOINTS, CA_BASE_URL, CA_ENDPOINTS } from '../constants';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { StartConfig } from '../interfaces/american.interfaces';

export default class CanadianVehicle extends Vehicle {
  private _status: VehicleStatus | null = null;
  public region = REGIONS.CA;

  private timeOffset = -(new Date().getTimezoneOffset() / 60) 

  constructor(public config, public controller) {
    super(controller);
    logger.info(`CA Vehicle ${this.config.vehicleId} created`);
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

  get vehicleId(): string {
    return this.config.vehicleId;
  }
  
  updateStatus(): Promise<VehicleStatus> {
    throw new Error('Method not implemented.');
  }
  startClimate(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  stopClimate(): Promise<string> {
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

  public async status(refresh = false): Promise<VehicleStatus> {
    const endpoint = refresh ? ALL_ENDPOINTS.CA.remoteStatus : ALL_ENDPOINTS.CA.status;
    const response = await this.request(endpoint, {});
    
    const data = response.result
    this._status = data as VehicleStatus;
    console.log(JSON.stringify(this._status))

    return Promise.resolve(this._status);
  }

  public async unlock(): Promise<string> {
    return Promise.reject();
  }

  public async lock(): Promise<string> {
    return Promise.reject();
  }

  public async start(startConfig: StartConfig): Promise<string> {
    return Promise.reject();
  }

  public async stop(): Promise<string> {
    return Promise.reject();
  }

  ///////////////////////////////////////////////////////////////////

  private async request(endpoint, body: object, headers: object = {}, ): Promise<any | null> {
    logger.info(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);

    try {
      const response = await got(endpoint, {
        method: 'POST',
        json: true,
        headers: {
          from: 'SPA',
          language: 1,
          offset: this.timeOffset,
          accessToken: this.controller.session.accessToken,
          vehicleId: this.config.vehicleId,
          ...headers
        },
        body: {
          pin: this.config.pin,
          ...body
        }
      });


      if (response.body.responseHeader.responseCode != 0)
      {
        return Promise.reject('bad request: ' + response.body.responseHeader.responseDesc)
      }

      // console.log( '********* response ' + JSON.stringify(response))
      return Promise.resolve(response.body);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }
}
