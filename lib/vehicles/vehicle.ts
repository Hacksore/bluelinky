// import AmericanVehicle from './americanVehicle';
import EuropeanVehicle from './europianVehicle';
// import CanadianVehicle from './canadianVehicle';

export class Vehicle {

  public get name() {
    return this.vehicle.name;
  }

  public get vin() {
    return this.vehicle.vin;
  }

  public get type() {
    return this.vehicle.type;
  }

  constructor(private vehicle: EuropeanVehicle){
  }

  public unlock() {
    this.vehicle.unlock();
  }

  public lock() {
    this.vehicle.lock();
  }


}
