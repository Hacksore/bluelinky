import { AmericanBlueLinkyConfig, AmericanController } from './controllers/american.controller';
import { EuropeanController, EuropeBlueLinkyConfig } from './controllers/european.controller';
import { CanadianBlueLinkyConfig, CanadianController } from './controllers/canadian.controller';
import { EventEmitter } from 'events';
import logger from './logger';
import { Session } from './interfaces/common.interfaces';
import { REGIONS } from './constants';
import AmericanVehicle from './vehicles/american.vehicle';
import EuropeanVehicle from './vehicles/european.vehicle';
import CanadianVehicle from './vehicles/canadian.vehicle';
import { SessionController } from './controllers/controller';
import { Vehicle } from './vehicles/vehicle';

type BluelinkyConfigRegions = AmericanBlueLinkyConfig|CanadianBlueLinkyConfig|EuropeBlueLinkyConfig;

const DEFAULT_CONFIG = {
  username: '',
  password: '',
  region: REGIONS.US,
  autoLogin: true,
  pin: '1234',
  vin: '',
  vehicleId: undefined,
};

class BlueLinky<
  T extends BluelinkyConfigRegions = AmericanBlueLinkyConfig,
  R = T['region'],
  V extends Vehicle = (R extends REGIONS.US ? AmericanVehicle : R extends REGIONS.CA ? CanadianVehicle : EuropeanVehicle)
> extends EventEmitter {
  private controller: SessionController;
  private vehicles: Array<V> = [];

  private config: T;

  constructor(config: T) {
    super();

    switch (config.region) {
      case REGIONS.EU:
        this.controller = new EuropeanController(config as EuropeBlueLinkyConfig);
        break;
      case REGIONS.US:
        this.controller = new AmericanController(config as AmericanBlueLinkyConfig);
        break;
      case REGIONS.CA:
        this.controller = new CanadianController(config as CanadianBlueLinkyConfig);
        break;
      default:
        throw new Error('Your region is not supported yet.');
    }

    // merge configs
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    if (config.autoLogin === undefined) {
      this.config.autoLogin = true;
    }

    this.onInit();
  }

  on(event: 'ready', fnc: (vehicles: V[]) => void): this;
  on(event: 'error', fnc: (error: any) => void): this;

  on(event: string|symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
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
      this.vehicles = await this.getVehicles();

      logger.debug(`Found ${this.vehicles.length} on the account`);

      this.emit('ready', this.vehicles);
      return response;
    } catch (error) {      
      this.emit('error', error);
      return error;
    }
  }

  async getVehicles(): Promise<V[]> {
    return (await this.controller.getVehicles() as unknown[]) as V[] || [];
  }

  public getVehicle(input: string): V | undefined {
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
