import { Vehicle } from './vehicles/vehicle';
import { EuropeanController } from './controllers/european.controller';
import SessionController from './controllers/controller';
import { EventEmitter } from 'events';


import logger from './logger';
import { BlueLinkyConfig } from './interfaces/common.interfaces';
import { REGIONS } from './constants';
import { AmericanController } from './controllers/american.controller';

class BlueLinky extends EventEmitter {

  private controller: SessionController;
  private autoLogin = true;

  constructor(config: BlueLinkyConfig) {
    super();

    switch(config.region){
      case REGIONS.EU:
        this.controller = new EuropeanController(config);
        break;
      case REGIONS.US:
        this.controller = new AmericanController(config);
        break;
      default:
        this.controller = new AmericanController(config);
        break;
    }

    if(this.controller === null){
      throw new Error('Your region is not supported yet.');
    }

    this.onInit();
  }

  async onInit(): Promise<string> {
    console.log('logon', this.autoLogin.toString())
    if(this.autoLogin){
      logger.info('Bluelinky is loging in automatically, to disable use autoLogin: false')
      await this.controller.login();      
    }
    this.emit('ready');
    return Promise.resolve('onInit done');
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    return this.controller.getVehicles() || [];   
  }

  async getVehicle(vin: string): Promise<Vehicle|undefined> {
    const vehicles = await this.controller.getVehicles();
    try { 
      return vehicles.find(car => car.vin === vin);
    } catch (err) {
      throw new Error('Vehicle not found!');
    }
  }

  async login(): Promise<string> {    
    const response = await this.controller.login();
    logger.info('Sending ready event!');
    this.emit('ready');
    return response;
  }

  public async refreshAccessToken(): Promise<string> {
    return this.controller.refreshAccessToken();
  }

  public async logout(): Promise<string> {
    return this.controller.logout();
  }

  public async enterPin(): Promise<string|undefined> {
    if (this.controller.enterPin) {
      return this.controller.enterPin();
    }
  }
}

export default BlueLinky;
