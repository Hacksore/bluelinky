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

  constructor(public vehicleConfig: RegisterVehicleConfig, public controller: EuropeanController) {
    super(vehicleConfig, controller);
    logger.debug(`EU Vehicle ${this.vehicleConfig.id} created`);
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

    const vehicleStatus = response.body.resMsg.vehicleStatusInfo.vehicleStatus;
    this._status = {
      chassis: {
        hoodOpen: vehicleStatus.hoodOpen,
        trunkOpen: vehicleStatus.trunkOpen,
        doors: {
          frontRight: !!vehicleStatus.doorOpen.frontRight,
          frontLeft: !!vehicleStatus.doorOpen.frontLeft,
          backLeft: !!vehicleStatus.doorOpen.backLeft,
          backRight: !!vehicleStatus.doorOpen.backRight,
        },
        tirePressureWarningLamp: {
          rearLeft: !!vehicleStatus.tirePressureLamp.tirePressureLampRL,
          frontLeft: !!vehicleStatus.tirePressureLamp.tirePressureLampFL,
          frontRight: !!vehicleStatus.tirePressureLamp.tirePressureLampFR,
          rearRight: !!vehicleStatus.tirePressureLamp.tirePressureLampRR,
          all: !!vehicleStatus.tirePressureLamp.tirePressureLampAll,
        },
      },
      climate: {
        active: vehicleStatus.airCtrlOn,
        steeringwheelHeat: !!vehicleStatus.steerWheelHeat,
        sideMirrorHeat: false,
        rearWindowHeat: !!vehicleStatus.sideBackWindowHeat,
        defrost: vehicleStatus.defrost,
        temperatureSetpoint: vehicleStatus.airTemp.value,
        temperatureUnit: vehicleStatus.airTemp.unit,
      },
      engine: {
        ignition: vehicleStatus.engine,
        adaptiveCruiseControl: vehicleStatus.acc,
        range: vehicleStatus.dte.value,
        charging: vehicleStatus?.evStatus?.batteryCharge,
        batteryCharge: vehicleStatus?.battery?.batSoc,
      },
      raw: vehicleStatus,
    };

    return Promise.resolve(this._status);
  }

  public async odometer(): Promise<Odometer | null> {
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

    this._odometer = response.body.resMsg.vehicleStatusInfo.odometer as Odometer;
    return Promise.resolve(this._odometer);
  }

  public async location(): Promise<VehicleLocation> {
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

    const data = response.body.resMsg.vehicleStatusInfo.vehicleLocation;
    this._location = {
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      altitude: data.coord.alt,
      speed: {
        unit: data.speed.unit,
        value: data.speed.value,
      },
      heading: data.head,
    };

    return Promise.resolve(this._location);
  }
}
