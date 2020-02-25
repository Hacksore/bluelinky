import { Vehicle } from '../vehicles/vehicle';

export default abstract class SessionController {
  abstract async login(): Promise<string>;
  abstract async logout(): Promise<string>;
  abstract async getVehicles(): Promise<Array<Vehicle>>;
}
