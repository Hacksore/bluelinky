import { BlueLinkyConfig } from '../interfaces/common.interfaces';

export class CanadianController {
  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: 'CA',
    autoLogin: true
  };

  login() {
    return 'OK';
  }
}
