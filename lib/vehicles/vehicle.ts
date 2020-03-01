import { VehicleStatus, VehicleLocation, Odometer, ClimateConfig } from '../interfaces/common.interfaces';
import { Session } from '../interfaces/common.interfaces';

export abstract class Vehicle {
  abstract get name(): string;
  abstract get vin(): string;
  abstract get gen(): string|null;
  abstract get type(): string;
  abstract get location(): VehicleLocation|null;
  abstract get odometer(): Odometer|null;
  abstract get status(): VehicleStatus|null;
  abstract async unlock(): Promise<string>;
  abstract async lock(): Promise<string>;
  abstract async start(config: ClimateConfig): Promise<string>;
  abstract async stop(): Promise<string>;
  abstract async update(): Promise<VehicleStatus>;

  constructor(public session: Session) {}
}
