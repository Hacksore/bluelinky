import { BlueLinkyConfig } from '../interfaces/common.interfaces';

export class CanadianController {
  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: 'CA',
    autoLogin: true,
    pin: null,
    deviceUuid: null
  };

  login() {
    return 'OK';
  }
}
