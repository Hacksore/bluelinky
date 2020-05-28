import {
  VehicleStatus,
  VehicleLocation,
  Odometer,
  ClimateConfig,
  RegisterVehicleConfig,
} from '../interfaces/common.interfaces';

import { StartConfig, BlueLinkyConfig } from '../interfaces/common.interfaces';
import { SessionController } from '../controllers/controller';
import { REGIONS } from '../constants';

export abstract class Vehicle {
  // methods to override in each region vehicle
  abstract async status(refresh: boolean): Promise<VehicleStatus>;
  abstract async unlock(): Promise<string>;
  abstract async lock(): Promise<string>;
  abstract async start(config: ClimateConfig | StartConfig): Promise<string>;
  abstract async stop(): Promise<string>;
  abstract async location(): Promise<VehicleLocation | null>;
  abstract async odometer(): Promise<Odometer | null>;

  public _status: VehicleStatus | null = null;
  public _location: VehicleLocation | null = null;
  public _odometer: Odometer | null = null;

  public userConfig: BlueLinkyConfig = {
    username: undefined,
    password: undefined,
    region: REGIONS.EU,
    autoLogin: true,
    pin: undefined,
    vin: undefined,
    vehicleId: undefined,
  };

  constructor(public vehicleConfig: RegisterVehicleConfig, public controller: SessionController) {
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
