import { Vehicle } from '../vehicles/vehicle';
import { Session } from '../interfaces/common.interfaces';

export default abstract class SessionController {
  abstract async login(): Promise<string>;
  abstract async logout(): Promise<string>;
  abstract async getVehicles(): Promise<Array<Vehicle>>;
  abstract async enterPin(): Promise<string>;
  abstract async refreshAccessToken(): Promise<string>;
  abstract session: Session;
}
