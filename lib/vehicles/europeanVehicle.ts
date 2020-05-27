import { REGIONS, EU_BASE_URL } from '../constants';
import {
  VehicleStatus,
  Odometer,
  VehicleLocation,
  ClimateConfig,
  RegisterVehicleConfig,
} from '../interfaces/common.interfaces';
import got from 'got';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { EuropeanController } from '../controllers/european.controller';
import { getTempCode } from '../util';

export default class EuropeanVehicle extends Vehicle {
  public region = REGIONS.EU;
  private _status: VehicleStatus | null = null;
  private _location: VehicleLocation | null = null;
  private _odometer: Odometer | null = null;

  constructor(public vehicleConfig: RegisterVehicleConfig, public controller: EuropeanController) {
    super(vehicleConfig, controller);
    logger.info(`EU Vehicle ${this.vehicleConfig.id} created`);
  }

  private async checkControlToken(): Promise<void> {
    if (this.controller.session?.controlTokenExpiresAt !== undefined) {
      if (
        this.controller.session.controlToken === '' ||
        new Date().getTime() > this.controller.session.controlTokenExpiresAt
      ) {
        await this.controller.enterPin();
      }
    }
  }

  public odometer(): Promise<Odometer | null> {
    throw new Error('Method not implemented.');
  }

  public location(): Promise<VehicleLocation> {
    throw new Error('Method not implemented.');
  }

  public async start(config: ClimateConfig): Promise<string> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/temperature`,
      {
        method: 'POST',
        body: {
          action: 'start',
          hvacType: 0,
          options: {
            defrost: config.defrost,
            heating1: config.windscreenHeating ? 1 : 0,
          },
          tempCode: getTempCode(config.temperature),
          unit: config.unit,
        },
        headers: {
          'Authorization': this.controller.session.controlToken,
          'ccsp-device-id': this.controller.session.deviceId,
          'Content-Type': 'application/json',
        },
        json: true,
      }
    );

    logger.info(`Climate started for vehicle ${this.vehicleConfig.id}`);

    return Promise.resolve(response.body);
  }

  public async stop(): Promise<string> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/temperature`,
      {
        method: 'POST',
        body: {
          action: 'stop',
          hvacType: 0,
          options: {
            defrost: true,
            heating1: 1,
          },
          tempCode: '10H',
          unit: 'C',
        },
        headers: {
          'Authorization': this.controller.session.controlToken,
          'ccsp-device-id': this.controller.session.deviceId,
          'Content-Type': 'application/json',
        },
        json: true,
      }
    );

    logger.info(`Climate stopped for vehicle ${this.vehicleConfig.id}`);

    return Promise.resolve(response.body);
  }

  public async lock(): Promise<string> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.controller.session.controlToken,
          'ccsp-device-id': this.controller.session.deviceId,
          'Content-Type': 'application/json',
        },
        body: {
          action: 'close',
          deviceId: this.controller.session.deviceId,
        },
        json: true,
      }
    );

    if (response.statusCode === 200) {
      logger.debug(`Vehicle ${this.vehicleConfig.id} locked`);
      return Promise.resolve('Lock successful');
    }

    return Promise.reject('Something went wrong!');
  }

  public async unlock(): Promise<string> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.controller.session.controlToken,
          'ccsp-device-id': this.controller.session.deviceId,
          'Content-Type': 'application/json',
        },
        body: {
          action: 'open',
          deviceId: this.controller.session.deviceId,
        },
        json: true,
      }
    );

    if (response.statusCode === 200) {
      logger.debug(`Vehicle ${this.vehicleConfig.id} unlocked`);
      return Promise.resolve('Unlock successful');
    }

    return Promise.reject('Something went wrong!');
  }

  public async status(): Promise<VehicleStatus> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status/latest`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.controller.session.controlToken,
          'ccsp-device-id': this.controller.session.deviceId,
          'Content-Type': 'application/json',
        },
        json: true,
      }
    );

    this._status = response.body.resMsg.vehicleStatusInfo.vehicleStatus as VehicleStatus;
    this._location = response.body.resMsg.vehicleStatusInfo.vehicleLocation as VehicleLocation;
    this._odometer = response.body.resMsg.vehicleStatusInfo.odometer as Odometer;

    logger.info(`Got new status for vehicle ${this.vehicleConfig.id}`);

    return Promise.resolve(this._status);
  }
}
