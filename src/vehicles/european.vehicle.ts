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
  EVPlugTypes,
  VehicleMonthlyReport,
  DeepPartial,
  VehicleTargetSOC,
  EVChargeModeTypes,
  VehicleDayTrip,
} from '../interfaces/common.interfaces';
import got from 'got';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { EuropeanController } from '../controllers/european.controller';
import { celciusToTempCode, tempCodeToCelsius } from '../util';
import { manageBluelinkyError, ManagedBluelinkyError } from '../tools/common.tools';
import { addMinutes, parse as parseDate } from 'date-fns';
import { EUPOIInformation } from '../interfaces/european.interfaces';

type ChargeTarget = 50 | 60 | 70 | 80 | 90 | 100;
const POSSIBLE_CHARGE_LIMIT_VALUES = [50, 60, 70, 80, 90, 100];

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
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/temperature`,
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
            'Stamp': this.controller.environment.stamp(),
          },
          json: true,
        }
      );
      logger.info(`Climate started for vehicle ${this.vehicleConfig.id}`);
      return response.body;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.start');
    }
  }

  public async stop(): Promise<string> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/temperature`,
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
            'Stamp': this.controller.environment.stamp(),
          },
          json: true,
        }
      );
      logger.info(`Climate stopped for vehicle ${this.vehicleConfig.id}`);
      return response.body;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.stop');
    }
  }

  public async lock(): Promise<string> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
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
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.lock');
    }
  }

  public async unlock(): Promise<string> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
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
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.unlock');
    }
  }

  public async fullStatus(input: VehicleStatusOptions): Promise<FullVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    await this.checkControlToken();

    try {
      const cachedResponse = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status/latest`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          json: true,
        }
      );

      const fullStatus = cachedResponse.body.resMsg.vehicleStatusInfo;

      if (statusConfig.refresh) {
        const statusResponse = await got(
          `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status`,
          {
            method: 'GET',
            headers: {
              'Authorization': this.controller.session.controlToken,
              'ccsp-device-id': this.controller.session.deviceId,
              'Content-Type': 'application/json',
              'Stamp': this.controller.environment.stamp(),
            },
            json: true,
          }
        );
        fullStatus.vehicleStatus = statusResponse.body.resMsg;

        const locationResponse = await got(
          `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`,
          {
            method: 'GET',
            headers: {
              'Authorization': this.controller.session.controlToken,
              'ccsp-device-id': this.controller.session.deviceId,
              'Content-Type': 'application/json',
              'Stamp': this.controller.environment.stamp(),
            },
            json: true,
          }
        );
        fullStatus.vehicleLocation = locationResponse.body.resMsg.gpsDetail;
      }

      this._fullStatus = fullStatus;
      return this._fullStatus;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.fullStatus');
    }
  }

  public async status(
    input: VehicleStatusOptions
  ): Promise<VehicleStatus | RawVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    await this.checkControlToken();

    try {
      const cacheString = statusConfig.refresh ? '' : '/latest';

      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status${cacheString}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          json: true,
        }
      );

      // handles refreshing data
      const vehicleStatus = statusConfig.refresh
        ? response.body.resMsg
        : response.body.resMsg.vehicleStatusInfo.vehicleStatus;

      const parsedStatus: VehicleStatus = {
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
          accessory: vehicleStatus?.acc,
          rangeGas:
            vehicleStatus?.evStatus?.drvDistance[0]?.rangeByFuel?.gasModeRange?.value ??
            vehicleStatus?.dte?.value,
          // EV
          range: vehicleStatus?.evStatus?.drvDistance[0]?.rangeByFuel?.totalAvailableRange?.value,
          rangeEV: vehicleStatus?.evStatus?.drvDistance[0]?.rangeByFuel?.evModeRange?.value,
          plugedTo: vehicleStatus?.evStatus?.batteryPlugin ?? EVPlugTypes.UNPLUGED,
          charging: vehicleStatus?.evStatus?.batteryCharge,
          estimatedCurrentChargeDuration: vehicleStatus?.evStatus?.remainTime2?.atc?.value,
          estimatedFastChargeDuration: vehicleStatus?.evStatus?.remainTime2?.etc1?.value,
          estimatedPortableChargeDuration: vehicleStatus?.evStatus?.remainTime2?.etc2?.value,
          estimatedStationChargeDuration: vehicleStatus?.evStatus?.remainTime2?.etc3?.value,
          batteryCharge12v: vehicleStatus?.battery?.batSoc,
          batteryChargeHV: vehicleStatus?.evStatus?.batteryStatus,
        },
        lastupdate: parseDate(vehicleStatus?.time, 'yyyyMMddHHmmSS', new Date())
      };

      if (!parsedStatus.engine.range) {
        if (parsedStatus.engine.rangeEV || parsedStatus.engine.rangeGas) {
          parsedStatus.engine.range =
            (parsedStatus.engine.rangeEV ?? 0) + (parsedStatus.engine.rangeGas ?? 0);
        }
      }

      this._status = statusConfig.parsed ? parsedStatus : vehicleStatus;

      return this._status;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.status');
    }
  }

  public async odometer(): Promise<VehicleOdometer | null> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/status/latest`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          json: true,
        }
      );
      this._odometer = response.body.resMsg.vehicleStatusInfo.odometer as VehicleOdometer;
      return this._odometer;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.odometer');
    }
  }

  public async location(): Promise<VehicleLocation> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          json: true,
        }
      );

      const data = response.body.resMsg?.gpsDetail ?? response.body.resMsg;
      this._location = {
        latitude: data?.coord?.lat,
        longitude: data?.coord?.lon,
        altitude: data?.coord?.alt,
        speed: {
          unit: data?.speed?.unit,
          value: data?.speed?.value,
        },
        heading: data?.head,
      };

      return this._location;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.location');
    }
  }

  public async startCharge(): Promise<string> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
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
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.startCharge');
    }
  }

  public async stopCharge(): Promise<string> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
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
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.stopCharge');
    }
  }

  public async monthlyReport(
    month: { year: number; month: number; } = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
  ): Promise<DeepPartial<VehicleMonthlyReport> | undefined> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/monthlyreport`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          body: {
            setRptMonth: toMonthDate(month)
          },
          json: true,
        }
      );
      const rawData = response.body.resMsg?.monthlyReport;
      if (rawData) {
        return {
          start: rawData.ifo?.mvrMonthStart,
          end: rawData.ifo?.mvrMonthEnd,
          breakdown: rawData.breakdown,
          driving: rawData.driving ? {
            distance: rawData.driving?.runDistance,
            startCount: rawData.driving?.engineStartCount,
            durations: {
              idle: rawData.driving?.engineIdleTime,
              drive: rawData.driving?.engineOnTime,
            }
          } : undefined,
          vehicleStatus: rawData.vehicleStatus ? {
            tpms: rawData.vehicleStatus?.tpmsSupport ? Boolean(rawData.vehicleStatus?.tpmsSupport) : undefined,
            tirePressure: {
              all: rawData.vehicleStatus?.tirePressure?.tirePressureLampAll == '1',
            }
          } : undefined,
        };
      }
      return;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.monthyReports');
    }
  }

  public async tripInfo(
    date: { year: number; month: number; day: number; } = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }
  ): Promise<DeepPartial<VehicleDayTrip>[] | undefined> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v1/spa/vehicles/${this.vehicleConfig.id}/tripinfo`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.accessToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          body: {
            setTripMonth: !date.day ? toMonthDate(date) : undefined,
            setTripLatest: 10,
            setTripDay: date.day ? toDayDate(date) : undefined,
            tripPeriodType: 1
          },
          json: true,
        }
      );

      const rawData = response.body.resMsg.dayTripList;
      if (rawData && Array.isArray(rawData)) {
        return rawData.map(day => ({
          dayRaw: day.tripDay,
          tripsCount: day.dayTripCnt,
          distance: day.tripDist,
          durations: {
            drive: day.tripDrvTime,
            idle: day.tripIdleTime
          },
          speed: {
            avg: day.tripAvgSpeed,
            max: day.tripMaxSpeed
          },
          trips: Array.isArray(day.tripList) ?
            day.tripList.map(trip => {
              const start = parseDate(`${day.tripDay}${trip.tripTime}`, 'yyyyMMddHHmmss', Date.now());
              return {
                timeRaw: trip.tripTime,
                start,
                end: addMinutes(start, trip.tripDrvTime),
                durations: {
                  drive: trip.tripDrvTime,
                  idle: trip.tripIdleTime,
                },
                speed: {
                  avg: trip.tripAvgSpeed,
                  max: trip.tripMaxSpeed,
                },
                distance: trip.tripDist,
              };
            })
            : [],
        }));
      }
      return;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.history');
    }
  }

  /**
   * Warning: Only works on EV
   */
  public async getChargeTargets(): Promise<DeepPartial<VehicleTargetSOC>[] | undefined> {
    await this.checkControlToken();
    try {
      const response = await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/charge/target`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          json: true,
        }
      );
      const rawData = response.body.resMsg?.targetSOClist;
      if (rawData && Array.isArray(rawData)) {
        return rawData.map((rawSOC) => ({
          distance: rawSOC.drvDistance?.distanceType?.distanceValue,
          targetLevel: rawSOC.targetSOClevel,
          type: rawSOC.plugType
        }));
      }
      return;
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.getChargeTargets');
    }
  }

  /**
   * Warning: Only works on EV
   */
  public async setChargeTargets(limits: { fast: ChargeTarget; slow: ChargeTarget; }): Promise<void> {
    await this.checkControlToken();
    if (!POSSIBLE_CHARGE_LIMIT_VALUES.includes(limits.fast) || !POSSIBLE_CHARGE_LIMIT_VALUES.includes(limits.slow)) {
      throw new ManagedBluelinkyError(`Charge target values are limited to ${POSSIBLE_CHARGE_LIMIT_VALUES.join(', ')}`);
    }
    try {
      await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/charge/target`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          body: {
            targetSOClist: [
              { plugType: EVChargeModeTypes.FAST, targetSOClevel: limits.fast },
              { plugType: EVChargeModeTypes.SLOW, targetSOClevel: limits.slow }
            ]
          },
          json: true,
        }
      );
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.setChargeTargets');
    }
  }

  /**
   * Define a navigation route
   * @param poiInformations The list of POIs and waypoint to go through
   */
  public async setNavigation(poiInformations: EUPOIInformation[]): Promise<void> {
    await this.checkControlToken();
    try {
      await got(
        `${this.controller.environment.baseUrl}/api/v2/spa/vehicles/${this.vehicleConfig.id}/location/routes`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.controller.session.controlToken,
            'ccsp-device-id': this.controller.session.deviceId,
            'Content-Type': 'application/json',
            'Stamp': this.controller.environment.stamp(),
          },
          body: {
            deviceID: this.controller.session.deviceId,
            poiInfoList: poiInformations,
          },
          json: true,
        }
      );
    } catch (err) {
      throw manageBluelinkyError(err, 'EuropeVehicle.setNavigation');
    }
  }
}

function toMonthDate(month: { year: number; month: number; }) {
  return `${month.year}${month.month.toString().padStart(2, '0')}`;
}

function toDayDate(date: { year: number; month: number; day: number; }) {
  return `${toMonthDate(date)}${date.day.toString().padStart(2, '0')}`;
}

