import { Vehicle } from './vehicles/vehicle';
import { EuropeanController } from './controllers/european.controller';
import SessionController from './controllers/controller';
import { EventEmitter } from 'events';


import logger from './logger';
import { BlueLinkyConfig } from './interfaces/common.interfaces';

class BlueLinky extends EventEmitter {

  controller: SessionController | null = null;

  constructor(config: BlueLinkyConfig) {
    super();

    switch(config.region){
      case "EU":
        this.controller = new EuropeanController(logger, config);
        break;
    }

    if(this.controller === null){
      throw('Your region is not supported yet.');
    }

    // do login for token here
    if(config.autoLogin){
      this.controller.login();
    }
  }

  async getVehicles(): Promise<Vehicle[]> {
    if(this.controller)
      return this.controller.getVehicles();
    else
      return [];
  }

  async login() {
    if(this.controller)
      return this.controller.login();
    else
      logger.warn('Controller not ready!');
  }

  logout() {
    this.controller?.logout();
  }
}

export default BlueLinky;
