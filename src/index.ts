import { AmericanBlueLinkyConfig, AmericanController } from './controllers/american.controller';
import { EuropeanController, EuropeBlueLinkyConfig } from './controllers/european.controller';
import { CanadianBlueLinkyConfig, CanadianController } from './controllers/canadian.controller';
import { ChineseBlueLinkConfig, ChineseController } from './controllers/chinese.controller';
import { EventEmitter } from 'events';
import logger from './logger';
import { Session } from './interfaces/common.interfaces';
import { REGIONS } from './constants';
import AmericanVehicle from './vehicles/american.vehicle';
import EuropeanVehicle from './vehicles/european.vehicle';
import CanadianVehicle from './vehicles/canadian.vehicle';
import ChineseVehicle from './vehicles/chinese.vehicle';
import { SessionController } from './controllers/controller';
import { Vehicle } from './vehicles/vehicle';
import { AustraliaBlueLinkyConfig, AustraliaController } from './controllers/australia.controller';
import AustraliaVehicle from './vehicles/australia.vehicle';

type BluelinkyConfigRegions =
  | AmericanBlueLinkyConfig
  | CanadianBlueLinkyConfig
  | EuropeBlueLinkyConfig
  | ChineseBlueLinkConfig
  | AustraliaBlueLinkyConfig;

const DEFAULT_CONFIG = {
  username: '',
  password: '',
  region: REGIONS.US,
  brand: 'hyundai',
  autoLogin: true,
  pin: '1234',
  vin: '',
  vehicleId: undefined,
};

export class BlueLinky<
  T extends BluelinkyConfigRegions = AmericanBlueLinkyConfig,
  REGION = T['region'],
  VEHICLE_TYPE extends Vehicle = REGION extends REGIONS.US
    ? AmericanVehicle
    : REGION extends REGIONS.CA
    ? CanadianVehicle
    : REGION extends REGIONS.CN
    ? ChineseVehicle
    : REGION extends REGIONS.AU
    ? AustraliaVehicle
    : EuropeanVehicle
> extends EventEmitter {
  private controller: SessionController;
  private vehicles: Array<VEHICLE_TYPE> = [];

  private config: T;

  constructor(config: T) {
    super();

    // merge configs
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    switch (config.region) {
      case REGIONS.EU:
        this.controller = new EuropeanController(this.config as EuropeBlueLinkyConfig);
        break;
      case REGIONS.US:
        this.controller = new AmericanController(this.config as AmericanBlueLinkyConfig);
        break;
      case REGIONS.CA:
        this.controller = new CanadianController(this.config as CanadianBlueLinkyConfig);
        break;
      case REGIONS.CN:
        this.controller = new ChineseController(this.config as ChineseBlueLinkConfig);
        break;
      case REGIONS.AU:
        this.controller = new AustraliaController(this.config as AustraliaBlueLinkyConfig);
        break;
      default:
        throw new Error('Your region is not supported yet.');
    }

    if (config.autoLogin === undefined) {
      this.config.autoLogin = true;
    }

    this.onInit();
  }

  on(event: 'ready', fnc: (vehicles: VEHICLE_TYPE[]) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: 'error', fnc: (error: any) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this {
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
      return (error as Error).message;
    }
  }

  async getVehicles(): Promise<VEHICLE_TYPE[]> {
    return ((await this.controller.getVehicles()) as unknown[] as VEHICLE_TYPE[]) || [];
  }

  // Note: I removed the use of ID being given here as it should be standardized that we find cars by VIN
  /**
   * Allows you to access a vehicle in your account by VIN
   * @param input - The VIN for the vehicle
   * @returns Vehicle
   */
  public getVehicle(input: string): VEHICLE_TYPE | undefined {
    try {
      const foundCar = this.vehicles.find(car => car.vin().toLowerCase() === input.toLowerCase());

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

  public get cachedVehicles(): VEHICLE_TYPE[] {
    return this.vehicles ?? [];
  }
}

export default BlueLinky;
