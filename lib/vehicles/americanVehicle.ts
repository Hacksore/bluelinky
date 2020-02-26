import { REGIONS, EU_ENDPOINTS, EU_BASE_URL } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';
import got from 'got';

import { EuropeanEndpoints } from '../interfaces/european.interfaces';

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

  private endpoints: EuropeanEndpoints = EU_ENDPOINTS;
  public region = REGIONS.EU;

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

  async onInit() {
    logger.info(`US Vehicle ${this.vehicleId} created`);
  }

  public async getStatus() {
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
