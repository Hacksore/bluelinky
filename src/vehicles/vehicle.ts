import {
  VehicleStatus,
  FullVehicleStatus,
  VehicleLocation,
  VehicleOdometer,
  VehicleClimateOptions,
  VehicleRegisterOptions,
} from '../interfaces/common.interfaces';

import {
  VehicleStartOptions,
  BlueLinkyConfig,
  RawVehicleStatus,
  VehicleStatusOptions,
} from '../interfaces/common.interfaces';
import { SessionController } from '../controllers/controller';
import { REGIONS } from '../constants';

export abstract class Vehicle {
  // methods to override in each region vehicle
  abstract status(
    input: VehicleStatusOptions
  ): Promise<VehicleStatus | RawVehicleStatus | null>;
  abstract fullStatus(
    input: VehicleStatusOptions
  ): Promise<FullVehicleStatus | null>;
  abstract unlock(): Promise<string>;
  abstract lock(): Promise<string>;
  abstract start(config: VehicleClimateOptions | VehicleStartOptions): Promise<string>;
  abstract stop(): Promise<string>;
  abstract location(): Promise<VehicleLocation | null>;
  abstract odometer(): Promise<VehicleOdometer | null>;

  public _fullStatus: FullVehicleStatus | null = null;
  public _status: VehicleStatus | RawVehicleStatus | null = null;
  public _location: VehicleLocation | null = null;
  public _odometer: VehicleOdometer | null = null;

  public userConfig: BlueLinkyConfig = {
    username: undefined,
    password: undefined,
    region: REGIONS.EU,
    brand: 'hyundai',
    autoLogin: true,
    pin: undefined,
    vin: undefined,
    vehicleId: undefined,
  };

  constructor(public vehicleConfig: VehicleRegisterOptions, public controller: SessionController) {
    this.userConfig = controller.userConfig;
  }

  public vin(): string {
    return this.vehicleConfig.vin;
  }

  public name(): string {
    return this.vehicleConfig.name;
  }

  public nickname(): string {
    return this.vehicleConfig.nickname;
  }

  public id(): string {
    return this.vehicleConfig.id;
  }

  public brandIndicator(): string {
    return this.vehicleConfig.brandIndicator;
  }
}
