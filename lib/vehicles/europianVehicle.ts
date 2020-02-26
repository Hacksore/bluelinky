import { REGIONS, EU_ENDPOINTS, EU_BASE_URL } from '../constants';
import { VehicleStatus, Odometer, VehicleLocation, ClimateConfig } from '../interfaces/common.interfaces';
import got from 'got';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { resolve } from 'dns';

export default class EuropeanVehicle extends Vehicle {

  get name(): string {
    return this.config.nickname;
  }

  get vinNumber(): string {
    return '';
  }

  get type(): string {
    return this.type;
  }

  get status(): VehicleStatus|null {
    return this._status;
  }

  get odometer(): Odometer|null {
    return this._odometer;
  }

  get location(): VehicleLocation|null {
    return this._location;
  }

  public region = REGIONS.EU;
  private _status: VehicleStatus|null = null;
  private _location: VehicleLocation|null = null;
  private _odometer: Odometer|null = null;

  constructor(
    public config,
    public session
  ) {
    super(session);
    this.onInit();
  }

  async onInit() {
    logger.info(`EU Vehicle ${this.config.id} created`);
  }

  startClimate(config: ClimateConfig): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if(this.config.controlToken !== ''){
        const response = got(
          `https://prd.eu-ccapi.hyundai.com:8080/api/v2/spa/vehicles/${this.config.id}/control/temperature`, {
          method: 'POST',
          body: {
            action: "start",
            hvacType: 0,
            options: {
                defrost: config.defrost,
                heating1: config.windscreenHeating ? 1 : 0
            },
            tempCode: this.getTempCode(config.temperature),
            unit: config.unit
          },
          headers: {
              'Authorization': this.session.controlToken,
              'ccsp-device-id': this.session.deviceId,
              'Content-Type': 'application/json'
          },
          json: true
        });

        logger.info(`Climate started for vehicle ${this.config.id}`);

        resolve('OK');

      } else {
          reject('Token not set');
      }
    });
  }

  stopClimate(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if(this.config.controlToken !== ''){
        const response = got(
          `https://prd.eu-ccapi.hyundai.com:8080/api/v2/spa/vehicles/${this.config.id}/control/temperature`, {
          method: 'POST',
          body: {
            action: "stop",
            hvacType: 0,
            options: {
                defrost: true,
                heating1: 1
            },
            tempCode: '10H',
            unit: 'C'
          },
          headers: {
              'Authorization': this.session.controlToken,
              'ccsp-device-id': this.session.deviceId,
              'Content-Type': 'application/json'
          },
          json: true
        });

        logger.info(`Climate stopped for vehicle ${this.config.id}`);

        resolve('OK');

      } else {
          reject('Token not set');
      }
    });
  }

  public async unlock(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.session.controlToken === '') {
        return reject('Token not set');
      }

      const response = await got(
        `${EU_BASE_URL}/api/v2/spa/vehicles/${this.config.id}/control/door`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.session.controlToken,
            'ccsp-device-id': this.session.deviceId,
          },
          body: {
            action: 'open',
            deviceId: this.session.deviceId,
          },
          json: true,
        }
      );

      logger.info(`Vehicle ${this.config.id} unlocked`);

      resolve('Unlock OK');

    });
  }

  updateStatus(): Promise<VehicleStatus> {
    return new Promise(async (resolve, reject) => {;
      if(this.session.controlToken !== ''){

        const response = await got(
          `${EU_BASE_URL}/api/v2/spa/vehicles/${this.config.id}/status/latest`,
          {
            method: 'GET',
            headers: {
              'Authorization': this.session.controlToken,
              'ccsp-device-id': this.session.deviceId
            },
            json: true,
          }
        )

        this._status = response.body.resMsg.vehicleStatusInfo.vehicleStatus as VehicleStatus;
        this._location = response.body.resMsg.vehicleStatusInfo.vehicleLocation as VehicleLocation;
        this._odometer = response.body.resMsg.vehicleStatusInfo.odometer as Odometer;

        logger.info(`Got new status for vehicle ${this.config.id}`);

        resolve(this._status);
      } else {
          reject('Token not set');
      }
    })
  }

  public async lock(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.session.controlToken === '') {
        return reject('Token not set');
      }

      const response = await got(
        `${EU_BASE_URL}/api/v2/spa/vehicles/${this.config.id}/control/door`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.session.controlToken,
            'ccsp-device-id': this.session.deviceId,
          },
          body: {
            action: 'close',
            deviceId: this.session.deviceId,
          },
          json: true,
        }
      );

      logger.info(`Vehicle ${this.config.id} locked`);
      
      resolve('Lock OK');
    });
  }

  getTempCode(temperature: number): string {
    switch(temperature) {
      case 15.0:
        return "02H";
      case 15.5:
        return "03H";
      case 16.0:
        return "04H";
      case 16.5:
        return "05H";
      case 17.0:
        return "06H";
      case 17.5:
        return "07H";
      case 18.0:
        return "08H";
      case 18.5:
        return "09H";
      case 19.0:
        return "0AH";
      case 19.5:
        return "0BH";
      case 20.0:
        return "0CH";
      case 20.5:
        return "0DH";
      case 21.0:
        return "0EH";
      case 21.5:
        return "0FH";
      case 22.0:
        return "10H";
      case 22.5:
        return "11H";
      case 23.0:
        return "12H";
      case 23.5:
        return "13H";
      case 24.0:
        return "14H";
      case 24.5:
        return "15H";
      case 25.0:
        return "16H";
      case 25.5:
        return "17H";
      case 26.0:
        return "18H";
      case 26.5:
        return "19H";
      case 27.0:
        return "1AH";
      case 27.5:
        return "1BH";
      case 28.0:
        return "1CH";
      case 28.5:
        return "1DH";
      case 29.0:
        return "1EH";
      case 29.5:
        return "1FH";
      case 30.0:
        return "20H";
      default:
        throw new Error('temperature out of bounds! min: 15.0* max: 30*, max step: 0.5');
    }
  }
}
