import got from 'got';
import logger from '../logger';

import {
  REGIONS,
  DEFAULT_VEHICLE_STATUS_OPTIONS,
  ChargeTarget,
  POSSIBLE_CHARGE_LIMIT_VALUES,
} from '../constants';

import {
  VehicleStartOptions,
  VehicleLocation,
  VehicleRegisterOptions,
  VehicleStatus,
  VehicleOdometer,
  VehicleStatusOptions,
  RawVehicleStatus,
  FullVehicleStatus,
  EVChargeModeTypes,
  VehicleInfo,
  VehicleFeatureEntry,
} from '../interfaces/common.interfaces';
import { Vehicle } from './vehicle';
import { celciusToTempCode, parseDate } from '../util';
import { CanadianController } from '../controllers/canadian.controller';
import { ManagedBluelinkyError } from '../tools/common.tools';


export interface CanadianInfo {
  vehicle: VehicleInfo;
  features: {
    seatHeatVent: {
      drvSeatHeatOption: number;
      astSeatHeatOption: number;
      rlSeatHeatOption: number;
      rrSeatHeatOption: number;
    };
    hvacTempType: number;
    targetMinSoc: number;
    strgWhlHeatingOption: number;
  };
  featuresModel: {
    features: [VehicleFeatureEntry];
  };
  status: RawVehicleStatus;
}

export default class CanadianVehicle extends Vehicle {
  public region = REGIONS.CA;
  private timeOffset = -(new Date().getTimezoneOffset() / 60);
  private _info: CanadianInfo | null = null;

  constructor(public vehicleConfig: VehicleRegisterOptions, public controller: CanadianController) {
    super(vehicleConfig, controller);
    logger.debug(`CA Vehicle ${this.vehicleConfig.id} created`);
  }

  public fullStatus(): Promise<FullVehicleStatus | null> {
    throw new Error('Method not implemented.');
  }

  public async status(
    input: VehicleStatusOptions
  ): Promise<VehicleStatus | RawVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    logger.debug('Begin status request, polling car', statusConfig.refresh);
    try {
      let vehicleStatus: RawVehicleStatus | null = null;
      if (statusConfig.useInfo) {
        await this.setInfo(statusConfig.refresh);
        if (this._info) {
          vehicleStatus = this._info.status;
        }
      } else {
        const endpoint = statusConfig.refresh
          ? this.controller.environment.endpoints.remoteStatus
          : this.controller.environment.endpoints.status;
        const response = await this.request(endpoint, {});
        vehicleStatus = response.result?.status;

        if (response?.error) {
          throw response?.error?.errorDesc;
        }
      }
      logger.debug(vehicleStatus);
      let parsedStatus: VehicleStatus | null = null;
      if (vehicleStatus) {
        parsedStatus = {
          chassis: {
            hoodOpen: vehicleStatus?.hoodOpen,
            trunkOpen: vehicleStatus?.trunkOpen,
            locked: vehicleStatus?.doorLock,
            openDoors: {
              frontRight: !!vehicleStatus?.doorOpen?.frontRight,
              frontLeft: !!vehicleStatus?.doorOpen?.frontLeft,
              backLeft: !!vehicleStatus?.doorOpen?.backLeft,
              backRight: !!vehicleStatus?.doorOpen?.backRight,
            },
            tirePressureWarningLamp: {
              rearLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampRearLeft,
              frontLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampFrontLeft,
              frontRight: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampFrontRight,
              rearRight: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampRearRight,
              all: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampAll,
            },
          },
          climate: {
            active: vehicleStatus?.airCtrlOn,
            steeringwheelHeat: !!vehicleStatus?.steerWheelHeat,
            sideMirrorHeat: false,
            rearWindowHeat: !!vehicleStatus?.sideBackWindowHeat,
            defrost: vehicleStatus?.defrost,
            temperatureSetpoint: vehicleStatus?.airTemp?.value,
            temperatureUnit: vehicleStatus?.airTemp?.unit,
          },

          // TODO: fix props for parsed???
          // Seems some of the translation would have to account for EV and ICE
          // as they are often in different locations on the response
          // example EV status is in lib/__mock__/canadianStatus.json
          engine: {
            ignition: vehicleStatus?.engine,
            accessory: vehicleStatus?.acc,
            range: vehicleStatus?.dte?.value,
            charging: vehicleStatus?.evStatus?.batteryCharge,
            batteryCharge12v: vehicleStatus?.battery?.batSoc,
            batteryChargeHV: vehicleStatus?.evStatus?.batteryStatus,
          },
          lastupdate: parseDate(vehicleStatus?.lastStatusDate),
        };
      }

      this._status = statusConfig.parsed ? parsedStatus : vehicleStatus;
      return this._status;
    } catch (err) {
      // @ts-ignore
      throw err.message;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Car commands with preauth (PIN)
  //////////////////////////////////////////////////////////////////////////////

  public async lock(): Promise<string> {
    logger.debug('Begin lock request');
    try {
      const preAuth = await this.getPreAuth();
      // assuming the API returns a bad status code for failed attempts
      await this.request(this.controller.environment.endpoints.lock, {}, { pAuth: preAuth });
      return 'Lock successful';
    } catch (err) {
      // @ts-ignore
      throw err.message;
    }
  }

  public async unlock(): Promise<string> {
    logger.debug('Begin unlock request');
    try {
      const preAuth = await this.getPreAuth();
      await this.request(this.controller.environment.endpoints.unlock, {}, { pAuth: preAuth });
      return 'Unlock successful';
    } catch (err) {
      // @ts-ignore
      throw err.message;
    }
  }

  /*
  airCtrl: Boolean,  // climatisation
  heating1: Boolean, // front defrost, airCtrl will be on
  defrost: Boolean,  // side mirrors & rear defrost
  airTempvalue: number | null  // temp in degrees for clim and heating 17-27
  */
  public async start(startConfig: VehicleStartOptions): Promise<string> {
    logger.debug('Begin startClimate request');
    try {
      const body = {
        hvacInfo: {
          airCtrl: (startConfig.hvac ?? false) || (startConfig.defrost ?? false) ? 1 : 0,
          defrost: startConfig.defrost ?? false,
          // postRemoteFatcStart: 1,
          heating1: startConfig.heatedFeatures ? 1 : 0,
        },
      };

      const airTemp = startConfig.temperature;
      // TODO: can we use getTempCode here from util?
      if (airTemp != null) {
        body.hvacInfo['airTemp'] = {
          value: celciusToTempCode(REGIONS.CA, airTemp),
          unit: 0,
          hvacTempType: 1,
        };
      } else if ((startConfig.hvac ?? false) || (startConfig.defrost ?? false)) {
        throw 'air temperature should be specified';
      }

      const preAuth = await this.getPreAuth();
      const response = await this.request(this.controller.environment.endpoints.start, body, {
        pAuth: preAuth,
      });

      logger.debug(response);

      if (response.responseHeader && response.responseHeader.responseCode === 0) {
        return 'Vehicle started!';
      }

      return 'Failed to start vehicle';
    } catch (err) {
      // @ts-ignore
      throw err.message;
    }
  }

  public async stop(): Promise<string> {
    logger.debug('Begin stop request');
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(this.controller.environment.endpoints.stop, {
        pAuth: preAuth,
      });
      return response;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  // TODO: type this
  public async lights(withHorn = false): Promise<string> {
    logger.debug('Begin lights request with horn ' + withHorn);
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(
        this.controller.environment.endpoints.hornlight,
        { horn: withHorn },
        { pAuth: preAuth }
      );
      return response;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  /**
   * Warning only works on EV vehicles
   * @returns
   */
  public async stopCharge(): Promise<void> {
    logger.debug('Begin stopCharge');
    const { stopCharge } = this.controller.environment.endpoints;
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(stopCharge, {
        pin: this.controller.userConfig.pin,
        pAuth: preAuth,
      });
      return response;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  /**
   * Warning only works on EV vehicles
   * @returns
   */
  public async startCharge(): Promise<void> {
    logger.debug('Begin startCharge');
    const { startCharge } = this.controller.environment.endpoints;
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(startCharge, {
        pin: this.controller.userConfig.pin,
        pAuth: preAuth,
      });
      return response;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  /**
   *  Warning only works on EV vehicles
   * @param limits
   * @returns Promise<void>
   */
  public async setChargeTargets(limits: { fast: ChargeTarget; slow: ChargeTarget }): Promise<void> {
    logger.debug('Begin setChargeTarget');
    if (
      !POSSIBLE_CHARGE_LIMIT_VALUES.includes(limits.fast) ||
      !POSSIBLE_CHARGE_LIMIT_VALUES.includes(limits.slow)
    ) {
      throw new ManagedBluelinkyError(
        `Charge target values are limited to ${POSSIBLE_CHARGE_LIMIT_VALUES.join(', ')}`
      );
    }

    const { setChargeTarget } = this.controller.environment.endpoints;
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(setChargeTarget, {
        pin: this.controller.userConfig.pin,
        pAuth: preAuth,
        tsoc: [
          { plugType: EVChargeModeTypes.FAST, level: limits.fast },
          { plugType: EVChargeModeTypes.SLOW, level: limits.slow },
        ],
      });
      return response;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  // TODO: @Seb to take a look at doing this
  public async odometer(): Promise<VehicleOdometer | null> {
    try {
      await this.setInfo();
      if (this._info) {
        return { unit: this._info.vehicle.odometer, value: this._info.vehicle.odometerUnit };
      } else {
        throw 'error: no info';
      }
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  public async location(): Promise<VehicleLocation> {
    logger.debug('Begin locate request');
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(
        this.controller.environment.endpoints.locate,
        {},
        { pAuth: preAuth }
      );
      this._location = response.result as VehicleLocation;
      return this._location;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Internal
  //////////////////////////////////////////////////////////////////////////////
  // Does this have to be done before every command?
  private async getPreAuth(): Promise<string> {
    logger.info('Begin pre-authentication');
    try {
      const response = await this.request(this.controller.environment.endpoints.verifyPin, {});
      return response.result.pAuth;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  // TODO: not sure how to type a dynamic response
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private async request(endpoint: string, body: any, headers: any = {}): Promise<any | null> {
    logger.debug(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);

    // add logic for token refresh to ensure we don't use a stale token
    await this.controller.refreshAccessToken();

    const options = {
      method: 'POST',
      json: true,
      throwHttpErrors: false,
      headers: {
        from: this.controller.environment.origin,
        language: 1,
        offset: this.timeOffset,
        accessToken: this.controller.session.accessToken,
        vehicleId: this.vehicleConfig.id,
        ...headers,
      },
      body: {
        pin: this.userConfig.pin,
        ...body,
      },
    };

    try {
      const response: any = await got(endpoint, options);

      if (response.body.responseHeader.responseCode != 0) {
        return response.body.responseHeader.responseDesc;
      }

      return response.body;
    } catch (err) {
      throw 'error: ' + err;
    }
  }

  private async setInfo(refresh = false): Promise<void> {
    if (this._info !== null && !refresh) {
      return;
    }
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(
        this.controller.environment.endpoints.vehicleInfo,
        {},
        { pAuth: preAuth }
      );
      this._info = response.result as CanadianInfo;
    } catch (err) {
      throw 'error: ' + err;
    }
  }
}
