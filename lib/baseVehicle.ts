import BlueLinky from './index';
import EventEmitter from 'events';
import { VehicleConfig } from './interfaces';
 
export default class BaseVehicle extends EventEmitter {

  public vin: string|null;
  public pin: string|null;
  public bluelinky: BlueLinky;
  public currentFeatures: object;
  public auth: any;

  constructor(config: VehicleConfig) {
    super();

    const { vin, pin, bluelinky, token} = config;
    this.vin = vin;
    this.pin = pin;
    this.bluelinky = bluelinky;
    this.currentFeatures = [];
    this.auth = {
      username: bluelinky.authConfig.username,
      accessToken: token
    };
  }

  addFeature(featureName, state) {
    this.currentFeatures[featureName] = (state === 'ON' ? true : false);
  }

  getVinNumber(): string|null {
    return this.vin;
  }

  hasFeature(featureName: string): boolean {
    return this.currentFeatures[featureName];
  }

  getFeatures(): object {
    return this.currentFeatures;
  }

}
