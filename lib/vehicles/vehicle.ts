export abstract class Vehicle {
  abstract get Name(): string;
  abstract get VIN(): string;
  abstract get Type(): string;
  abstract async Unlock(): Promise<string>;
  abstract async Lock(): Promise<string>;
}
