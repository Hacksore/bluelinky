import { REGIONS } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';

import logger from '../logger';
import { Vehicle } from './vehicle';

export default class EuropeanVehicle extends Vehicle {

  get location(): VehicleLocation | null {
    throw new Error('Method not implemented.');
  }
  get odometer(): Odometer | null {
    throw new Error('Method not implemented.');
  }

  get status(): VehicleStatus {
    throw new Error('Method not implemented.');
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
    return this.nickname;
  }

  get vinNumber(): string {
    return '';
  }

  get type(): string {
    return this.type;
  }

  public region = REGIONS.CA;

  constructor(
    public master: boolean,
    public nickname: string,
    public regDate: string,
    public vehicleId: string,
    public vehicleName: string,
    public session
  ) {
    super(session);
    this.onInit();
  }

  onInit(): void {
    logger.info(`CA Vehicle ${this.vehicleId} created`);
  }

  public getStatus(): void {
    // TODO:
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
