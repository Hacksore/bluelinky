import { REGIONS } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';

import logger from '../logger';
import { Vehicle } from './vehicle';

export default class CanadianVehicle extends Vehicle {
  public region = REGIONS.CA;

  constructor(public config, public controller) {
    super(controller);
    logger.info(`CA Vehicle ${this.config.regId} created`);
  }

  get gen(): number {
    return this.config.gen;
  }

  get vin(): string {
    return this.config.vin;
  }

  get name(): string {
    return this.config.nickname;
  }

  get vinNumber(): string {
    return '';
  }

  get location(): VehicleLocation | null {
    throw new Error('Method not implemented.');
  }

  get odometer(): Odometer | null {
    throw new Error('Method not implemented.');
  }

  get type(): string {
    return this.type;
  }

  async status(): Promise<VehicleStatus> {
    throw new Error('Method not implemented.');
  }

  public updateStatus(): Promise<VehicleStatus> {
    throw new Error('Method not implemented.');
  }

  public async start(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  
  public async stop(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public async unlock(): Promise<string> {
    return Promise.reject();
  }

  public async lock(): Promise<string> {
    return Promise.reject();
  }
}
