import { REGIONS } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { StartConfig } from '../interfaces/american.interfaces';

export default class CanadianVehicle extends Vehicle {
  private _status: VehicleStatus | null = null;
  public region = REGIONS.CA;

  constructor(public config, public controller) {
    super(controller);
    logger.info(`CA Vehicle ${this.config.regId} created`);
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
    throw new Error('Method not implemented.');
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

}
