import { Vehicle } from '../vehicles/vehicle';
import { Session } from '../interfaces/common.interfaces';
import { BlueLinkyConfig } from '../interfaces/common.interfaces';
// changed this to interface so we can have option things?
export abstract class SessionController<T extends BlueLinkyConfig = BlueLinkyConfig> {
  abstract login(): Promise<string>;
  abstract logout(): Promise<string>;
  abstract getVehicles(): Promise<Array<Vehicle>>;
  abstract refreshAccessToken(): Promise<string>;
  public session: Session = {
    accessToken: '',
    refreshToken: '',
    controlToken: '',
    deviceId: '',
    tokenExpiresAt: 0,
  };

  constructor(public readonly userConfig: T) {}
}
