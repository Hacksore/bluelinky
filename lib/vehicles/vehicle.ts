export abstract class Vehicle {
  abstract get name(): string;
  abstract get vinNumber(): string;
  abstract get type(): string;
  abstract async unlock(): Promise<string>;
  abstract async lock(): Promise<string>;

  constructor(public session: any) {}
}
