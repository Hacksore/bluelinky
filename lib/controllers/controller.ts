import { Vehicle } from '../vehicles/vehicle';
import { Session } from '../interfaces/common.interfaces';
import { BlueLinkyConfig } from '../interfaces/common.interfaces';
// changed this to interface so we can have option things?
export default interface SessionController {
  login(): Promise<string>;
  logout(): Promise<string>;
  getVehicles(): Promise<Array<Vehicle>>;
  refreshAccessToken(): Promise<string>;
  session: Session;
  config: BlueLinkyConfig;
}
