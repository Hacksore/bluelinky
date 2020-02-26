import { Vehicle } from './vehicles/vehicle';
import { EuropeanController } from './controllers/european.controller';
import SessionController from './controllers/controller';
import { EventEmitter } from 'events';


import logger from './logger';
import { BlueLinkyConfig } from './interfaces/common.interfaces';
import { REGIONS } from './constants';
import { AmericanController } from './controllers/american.controller';

class BlueLinky extends EventEmitter {

  controller: SessionController | null = null;

  constructor(config: BlueLinkyConfig) {
    super();

    switch(config.region){
      case REGIONS.EU:
        this.controller = new EuropeanController(config);
        break;
      case REGIONS.US:
        this.controller = new AmericanController(config);
        break;
    }

    if(this.controller === null){
      throw new Error('Your region is not supported yet.');
    }

    // do login for token here
    if(config.autoLogin){
      this.controller.login();
    }
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    if(this.controller)
      return this.controller.getVehicles();
    else
      return [];
  }

  async login(): Promise<string> {
    if (this.controller) {
      return this.controller.login();
    }
    
    logger.warn('Controller not ready!');
    return '';
  }

  async refreshAccessToken(): Promise<string> {
    if (this.controller) {
      return this.controller.refreshAccessToken();
    }
    // this does not seem right
    logger.warn('Controller not ready!');
    return '';
  }

  logout(): void {
    this.controller?.logout();
  }

  async enterPin(): Promise<string|undefined> {
    return this.controller?.enterPin();
  }
}

export default BlueLinky;
