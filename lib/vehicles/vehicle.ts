import { VehicleStatus, VehicleLocation, Odometer, ClimateConfig } from '../interfaces/common.interfaces';
import { Session } from '../interfaces/common.interfaces';
import { StartConfig } from '../interfaces/american.interfaces';

export abstract class Vehicle {
  abstract get name(): string;
  abstract get vin(): string;
  abstract get type(): string;
  abstract get location(): VehicleLocation|null;
  abstract get odometer(): Odometer|null;
  abstract get gen(): string|null;
  abstract async status(boolean: boolean): Promise<VehicleStatus|null>;
  abstract async unlock(): Promise<string>;
  abstract async lock(): Promise<string>;
  abstract async start(config: ClimateConfig|StartConfig): Promise<string>;
  abstract async stop(): Promise<string>;

  constructor(public session: Session) {}
}
