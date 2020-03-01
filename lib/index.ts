import { AmericanController } from './controllers/american.controller';
import { EuropeanController } from './controllers/european.controller';
import SessionController from './controllers/controller';
import { EventEmitter } from 'events';
import logger from './logger';
import { BlueLinkyConfig } from './interfaces/common.interfaces';
import { REGIONS } from './constants';
import { Vehicle } from './vehicles/vehicle';

class BlueLinky extends EventEmitter {

  private controller: SessionController;
  private vehicles: Array<Vehicle> = [];

  private config: BlueLinkyConfig = {
    username: '',
    password: '',
    region: 'US',
    pin: '1234',
    autoLogin: true,
    vin: '',
    deviceUuid: '',
  }

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

    // merge configs
    this.config = {      
      ...this.config,
      ...config,
    }

    if (config.autoLogin === undefined) {
      this.config.autoLogin = true;
    }

    this.onInit();
  }

  private onInit(): void {
    console.log('test', this.config.autoLogin.toString())
    if(this.config.autoLogin){
      logger.info('Bluelinky is loging in automatically, to disable use autoLogin: false')
      this.login();
    }
  }

  public async login(): Promise<string> {
    const response = await this.controller.login();

    // get all cars from the controller
    this.vehicles = await this.controller.getVehicles();
    
    logger.debug(`Found ${this.vehicles.length} on the account`);

    this.emit('ready', this.vehicles);
    return response;
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    return this.controller.getVehicles() || [];   
  }

  public getVehicle(vin: string): Vehicle|undefined {
    try {
      return this.vehicles.find(car => car.vin === vin) as Vehicle;
    } catch (err) {
      throw new Error('Vehicle not found!');
    }
  }

  public async refreshAccessToken(): Promise<string> {
    return this.controller.refreshAccessToken();
  }

  public async logout(): Promise<string> {
    return this.controller.logout();
  }

  // This is EU specific from what I know
  public async enterPin(): Promise<string|undefined> {
    if (this.controller.enterPin) {
      return this.controller.enterPin();
    }
  }
}

export default BlueLinky;
