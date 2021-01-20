import { AmericanController } from './controllers/american.controller';
import { EuropeanController } from './controllers/european.controller';
import { CanadianController } from './controllers/canadian.controller';
import { SessionController } from './controllers/controller';
import { EventEmitter } from 'events';
import logger from './logger';
import { BlueLinkyConfig, Session } from './interfaces/common.interfaces';
import { REGIONS } from './constants';
import { Vehicle } from './vehicles/vehicle';

class BlueLinky extends EventEmitter {
  private controller: SessionController;
  private vehicles: Array<Vehicle> = [];

  private config: BlueLinkyConfig = {
    username: '',
    password: '',
    region: REGIONS.US,
    autoLogin: true,
    pin: '1234',
    vin: '',
    vehicleId: undefined,
  };

  constructor(config: BlueLinkyConfig) {
    super();

    switch (config.region) {
      case REGIONS.EU:
        this.controller = new EuropeanController(config);
        break;
      case REGIONS.US:
        this.controller = new AmericanController(config);
        break;
      case REGIONS.CA:
        this.controller = new CanadianController(config);
        break;
      default:
        throw new Error('Your region is not supported yet.');
    }

    // merge configs
    this.config = {
      ...this.config,
      ...config,
    };

    if (config.autoLogin === undefined) {
      this.config.autoLogin = true;
    }

    this.onInit();
  }

  private onInit(): void {
    if (this.config.autoLogin) {
      logger.debug('Bluelinky is logging in automatically, to disable use autoLogin: false');
      this.login();
    }
  }

  public async login(): Promise<string> {

    try {
      const response = await this.controller.login();

      // get all cars from the controller
      this.vehicles = await this.controller.getVehicles();

      logger.debug(`Found ${this.vehicles.length} on the account`);

      this.emit('ready', this.vehicles);
      return response;
    } catch (error) {      
      this.emit('error', error);
      return error;
    }
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    return this.controller.getVehicles() || [];
  }

  public getVehicle(input: string): Vehicle | undefined {
    try {
      const foundCar = this.vehicles.find(car => {
        return car.vin() === input || car.id() === input;
      });

      if (!foundCar && this.vehicles.length > 0) {
        throw new Error(`Could not find vehicle with id: ${input}`);
      }

      return foundCar;
    } catch (err) {
      throw new Error(`Vehicle not found: ${input}!`);
    }
  }

  public async refreshAccessToken(): Promise<string> {
    return this.controller.refreshAccessToken();
  }

  public async logout(): Promise<string> {
    return this.controller.logout();
  }

  public getSession(): Session | null {
    return this.controller.session;
  }
}

export default BlueLinky;
