import { BlueLinkyConfig } from './../interfaces/common.interfaces';
import { EuropeanController } from './european.controller';
import { AmericanController } from './american.controller';
import { CanadianController } from './canadian.controller';
import { Vehicle } from '../vehicles/vehicle';
import logger from '../logger';

export class SessionController {
  constructor(private controller: EuropeanController, config: BlueLinkyConfig) {
    controller.config = config;
  }

  async login() { // Expect result string
    const result = await this.controller.login();
    logger.info(result);
  }

  logout() {
    this.controller.logout();
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    return this.controller.getVehicles();
  }
}
