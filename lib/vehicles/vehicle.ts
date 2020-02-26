import { VehicleStatus, VehicleLocation, Odometer, ClimateConfig } from '../interfaces/common.interfaces';

export abstract class Vehicle {
  abstract get name(): string;
  abstract get vinNumber(): string;
  abstract get type(): string;
  abstract get status(): VehicleStatus|null;
  abstract get location(): VehicleLocation|null;
  abstract get odometer(): Odometer|null;
  abstract async unlock(): Promise<string>;
  abstract async lock(): Promise<string>;
  abstract async startClimate(config: ClimateConfig): Promise<string>;
  abstract async stopClimate(): Promise<string>;
  abstract async updateStatus(): Promise<VehicleStatus>;

  constructor(public session: any) {}
}
