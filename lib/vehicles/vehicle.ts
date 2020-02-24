// import AmericanVehicle from './americanVehicle';
import EuropeanVehicle from './europianVehicle';
// import CanadianVehicle from './canadianVehicle';

export class Vehicle {

  constructor(private vehicle: EuropeanVehicle){}

  unlock() {
    this.vehicle.unlock();
  }

  lock() {
    this.vehicle.lock();
  }


}
