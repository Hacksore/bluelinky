import {
  VehicleStatus,
  VehicleLocation,
  Odometer,
  ClimateConfig,
  RegisterVehicleConfig,
} from '../interfaces/common.interfaces';

import { StartConfig } from '../interfaces/common.interfaces';
import SessionController from '../controllers/controller';

export abstract class Vehicle {
  // methods to override in each region vehicle
  abstract async status(refresh: boolean): Promise<VehicleStatus>;
  abstract async unlock(): Promise<string>;
  abstract async lock(): Promise<string>;
  abstract async start(config: ClimateConfig | StartConfig): Promise<string>;
  abstract async stop(): Promise<string>;
  abstract async location(): Promise<VehicleLocation | null>;
  abstract async odometer(): Promise<Odometer | null>;

  constructor(public config: RegisterVehicleConfig, public controller: SessionController) {}

  public vin(): string {
    return this.config.vin;
  }

  public name(): string {
    return this.config.name;
  }

  public nickname(): string {
    return this.config.name;
  }

  public id(): string {
    return this.config.id;
  }

  public brandIndicator(): string {
    return this.config.brandIndicator;
  }
}
