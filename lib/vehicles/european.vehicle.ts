import { REGIONS, DEFAULT_VEHICLE_STATUS_OPTIONS } from '../constants';
import {
  VehicleStatus,
  FullVehicleStatus,
  VehicleOdometer,
  VehicleLocation,
  VehicleClimateOptions,
  VehicleRegisterOptions,
  VehicleStatusOptions,
  RawVehicleStatus,
} from '../interfaces/common.interfaces';
import got from 'got';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { EuropeanController } from '../controllers/european.controller';
import { celciusToTempCode, tempCodeToCelsius } from '../util';
import { EU_BASE_URL } from '../constants/europe';

export default class EuropeanVehicle extends Vehicle {
  public region = REGIONS.EU;

  constructor(public vehicleConfig: VehicleRegisterOptions, public controller: EuropeanController) {
    super(vehicleConfig, controller);
    logger.debug(`EU Vehicle ${this.vehicleConfig.id} created`);
  }

  private async checkControlToken(): Promise<void> {
    await this.controller.refreshAccessToken();
    if (this.controller.session?.controlTokenExpiresAt !== undefined) {
      if (
        !this.controller.session.controlToken ||
        Date.now() / 1000 > this.controller.session.controlTokenExpiresAt
      ) {
        await this.controller.enterPin();
      }
    }
  }

  public async start(config: VehicleClimateOptions): Promise<string> {
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
          tempCode: celciusToTempCode(config.temperature),
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

    return response.body;
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

    return response.body;
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
      return 'Lock successful';
    }

    return 'Something went wrong!';
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
      return 'Unlock successful';
    }

    return 'Something went wrong!';
  }

  public async fullStatus(
    input: VehicleStatusOptions
  ): Promise<FullVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    await this.checkControlToken();

    const cachedResponse = await got(
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

    const fullStatus = cachedResponse.body.resMsg.vehicleStatusInfo;

    if(statusConfig.refresh) {
      const statusResponse = await got(
        `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status`,
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
      fullStatus.vehicleStatus = statusResponse.body.resMsg;

      const locationResponse = await got(
        `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`,
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
      fullStatus.vehicleLocation = locationResponse.body.resMsg.gpsDetail;
    }

    this._fullStatus = fullStatus;
    return Promise.resolve(this._fullStatus);
  }

  public async status(
    input: VehicleStatusOptions
  ): Promise<VehicleStatus | RawVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    await this.checkControlToken();

    const cacheString = statusConfig.refresh ? '' : '/latest';

    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status${cacheString}`,
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

    // handles refreshing data
    const vehicleStatus = statusConfig.refresh
      ? response.body.resMsg
      : response.body.resMsg.vehicleStatusInfo.vehicleStatus;

    const parsedStatus = {
      chassis: {
        hoodOpen: vehicleStatus?.hoodOpen,
        trunkOpen: vehicleStatus?.trunkOpen,
        locked: vehicleStatus.doorLock,
        openDoors: {
          frontRight: !!vehicleStatus?.doorOpen?.frontRight,
          frontLeft: !!vehicleStatus?.doorOpen?.frontLeft,
          backLeft: !!vehicleStatus?.doorOpen?.backLeft,
          backRight: !!vehicleStatus?.doorOpen?.backRight,
        },
        tirePressureWarningLamp: {
          rearLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureLampRL,
          frontLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureLampFL,
          frontRight: !!vehicleStatus?.tirePressureLamp?.tirePressureLampFR,
          rearRight: !!vehicleStatus?.tirePressureLamp?.tirePressureLampRR,
          all: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampAll,
        },
      },
      climate: {
        active: vehicleStatus?.airCtrlOn,
        steeringwheelHeat: !!vehicleStatus?.steerWheelHeat,
        sideMirrorHeat: false,
        rearWindowHeat: !!vehicleStatus?.sideBackWindowHeat,
        defrost: vehicleStatus?.defrost,
        temperatureSetpoint: tempCodeToCelsius(vehicleStatus?.airTemp?.value),
        temperatureUnit: vehicleStatus?.airTemp?.unit,
      },
      engine: {
        ignition: vehicleStatus.engine,
        adaptiveCruiseControl: vehicleStatus?.acc,
        range: vehicleStatus?.evStatus?.drvDistance[0].rangeByFuel?.totalAvailableRange?.value,
        charging: vehicleStatus?.evStatus?.batteryCharge,
        batteryCharge12v: vehicleStatus?.battery?.batSoc,
        batteryChargeHV: vehicleStatus?.evStatus?.batteryStatus,
      },
    } as VehicleStatus;

    this._status = statusConfig.parsed ? parsedStatus : vehicleStatus;

    return this._status;
  }

  public async odometer(): Promise<VehicleOdometer | null> {
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

    this._odometer = response.body.resMsg.vehicleStatusInfo.odometer as VehicleOdometer;
    return this._odometer;
  }

  public async location(): Promise<VehicleLocation> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`,
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

    const data = response.body.resMsg.gpsDetail;
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

    return this._location;
  }

  public async startCharge(): Promise<string> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.controller.session.controlToken,
          'ccsp-device-id': this.controller.session.deviceId,
          'Content-Type': 'application/json',
        },
        body: {
          action: 'start',
          deviceId: this.controller.session.deviceId,
        },
        json: true,
      }
    );

    if (response.statusCode === 200) {
      logger.debug(`Send start charge command to Vehicle ${this.vehicleConfig.id}`);
      return 'Start charge successful';
    }

    throw 'Something went wrong!';
  }

  public async stopCharge(): Promise<string> {
    await this.checkControlToken();
    const response = await got(
      `${EU_BASE_URL}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.controller.session.controlToken,
          'ccsp-device-id': this.controller.session.deviceId,
          'Content-Type': 'application/json',
        },
        body: {
          action: 'stop',
          deviceId: this.controller.session.deviceId,
        },
        json: true,
      }
    );

    if (response.statusCode === 200) {
      logger.debug(`Send stop charge command to Vehicle ${this.vehicleConfig.id}`);
      return 'Stop charge successful';
    }

    throw 'Something went wrong!';
  }
}
