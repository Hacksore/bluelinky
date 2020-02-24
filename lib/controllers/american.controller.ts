import { BlueLinkyConfig } from '../interfaces/common.interfaces';

export class AmericanController {
  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: 'US',
    autoLogin: true
  };

  login() {
    return 'OK';
  }
}
