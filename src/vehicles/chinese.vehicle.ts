import {
  REGIONS,
  DEFAULT_VEHICLE_STATUS_OPTIONS,
  POSSIBLE_CHARGE_LIMIT_VALUES,
  ChargeTarget,
} from '../constants';
import {
  VehicleStatus,
  FullVehicleStatus,
  VehicleOdometer,
  VehicleLocation,
  VehicleRegisterOptions,
  VehicleStatusOptions,
  RawVehicleStatus,
  EVPlugTypes,
  VehicleMonthlyReport,
  DeepPartial,
  VehicleTargetSOC,
  EVChargeModeTypes,
  VehicleDayTrip,
  VehicleMonthTrip,
  VehicleStartOptions,
} from '../interfaces/common.interfaces';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { ChineseController } from '../controllers/chinese.controller';
import { celciusToTempCode, tempCodeToCelsius, parseDate, addMinutes } from '../util';
import { manageBluelinkyError, ManagedBluelinkyError } from '../tools/common.tools';
import {
  CNDatedDriveHistory,
  CNDriveHistory,
  CNPOIInformation,
  historyDrivingPeriod,
} from '../interfaces/chinese.interfaces';
import got from 'got';

export default class ChineseVehicle extends Vehicle {
  public region = REGIONS.CN;
  public serverRates: {
    max: number;
    current: number;
    reset?: Date;
    updatedAt?: Date;
  } = {
    max: -1,
    current: -1,
  };

  constructor(public vehicleConfig: VehicleRegisterOptions, public controller: ChineseController) {
    super(vehicleConfig, controller);
    logger.debug(`CN Vehicle ${this.vehicleConfig.id} created`);
  }

  /**
   * 
   * @param config - Vehicle start configuration for the request
   * @returns Promise<string>
   * @remarks - not sure if this supports starting ICE vehicles
   */
  public async start(config: VehicleStartOptions): Promise<string> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/engine`, {
          body: {
            action: 'start',
            hvacType: 1,
            options: {
              defrost: config.defrost,
              heating1: config.heatedFeatures ? 1 : 0,
            },
            tempCode: celciusToTempCode(REGIONS.CN, config.temperature),
            unit: config.unit,
          },
        })
      );
      logger.info(`Climate started for vehicle ${this.vehicleConfig.id}`);
      return response.body;
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.start');
    }
  }

  public async stop(): Promise<string> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/engine`, {
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
        })
      );
      logger.info(`Climate stopped for vehicle ${this.vehicleConfig.id}`);
      return response.body;
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.stop');
    }
  }

  public async lock(): Promise<string> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`, {
          body: {
            action: 'close',
            deviceId: this.controller.session.deviceId,
          },
        })
      );
      if (response.statusCode === 200) {
        logger.debug(`Vehicle ${this.vehicleConfig.id} locked`);
        return 'Lock successful';
      }
      return 'Something went wrong!';
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.lock');
    }
  }

  public async unlock(): Promise<string> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/door`, {
          body: {
            action: 'open',
            deviceId: this.controller.session.deviceId,
          },
        })
      );

      if (response.statusCode === 200) {
        logger.debug(`Vehicle ${this.vehicleConfig.id} unlocked`);
        return 'Unlock successful';
      }

      return 'Something went wrong!';
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.unlock');
    }
  }

  public async fullStatus(input: VehicleStatusOptions): Promise<FullVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    const http = await this.controller.getVehicleHttpService();

    try {
      
      const cachedResponse = this.updateRates(
        await http.get(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/status/latest`)
      );

      const fullStatus = cachedResponse.body.resMsg.status;

      if (statusConfig.refresh) {
        const statusResponse = this.updateRates(
          await http.get(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/status`)
        );
        fullStatus.vehicleStatus = statusResponse.body.resMsg.status;

        const locationResponse = this.updateRates(
          await http.get(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`)
        );
        fullStatus.vehicleLocation = locationResponse.body.resMsg.coord;
      }

      this._fullStatus = fullStatus;
      return this._fullStatus;
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.fullStatus');
    }
  }
  
  public async status(
    input: VehicleStatusOptions
  ): Promise<VehicleStatus | RawVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    const http = await this.controller.getVehicleHttpService();

    try {
      const cacheString = statusConfig.refresh ? '' : '/latest';

      const response = this.updateRates(
        await http.get(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/status${cacheString}`)
      );

      // handles refreshing data
      const vehicleStatus =response.body.resMsg.status;

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
          temperatureSetpoint: tempCodeToCelsius(REGIONS.EU, vehicleStatus?.airTemp?.value),
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
        lastupdate: vehicleStatus?.time ? parseDate(vehicleStatus?.time) : null,
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
      throw manageBluelinkyError(err, 'ChinaVehicle.status');
    }
  }

  public async odometer(): Promise<VehicleOdometer | null> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.get(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/status/latest`)
      );
      this._odometer = response.body.resMsg.status.odometer as VehicleOdometer;
      return this._odometer;
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.odometer');
    }
  }

  public async location(): Promise<VehicleLocation> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.get(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/location`)
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
      throw manageBluelinkyError(err, 'ChinaVehicle.location');
    }
  }

  public async startCharge(): Promise<string> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`, {
          body: {
            action: 'start',
            deviceId: this.controller.session.deviceId,
          },
        })
      );

      if (response.statusCode === 200) {
        logger.debug(`Send start charge command to Vehicle ${this.vehicleConfig.id}`);
        return 'Start charge successful';
      }

      throw 'Something went wrong!';
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.startCharge');
    }
  }

  public async stopCharge(): Promise<string> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`, {
          body: {
            action: 'stop',
            deviceId: this.controller.session.deviceId,
          },
        })
      );

      if (response.statusCode === 200) {
        logger.debug(`Send stop charge command to Vehicle ${this.vehicleConfig.id}`);
        return 'Stop charge successful';
      }

      throw 'Something went wrong!';
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.stopCharge');
    }
  }

  public async monthlyReport(
    month: { year: number; month: number } = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    }
  ): Promise<DeepPartial<VehicleMonthlyReport> | undefined> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/monthlyreport`, {
          body: {
            setRptMonth: toMonthDate(month),
          },
        })
      );
      const rawData = response.body.resMsg?.monthlyReport;
      if (rawData) {
        return {
          start: rawData.ifo?.mvrMonthStart,
          end: rawData.ifo?.mvrMonthEnd,
          breakdown: rawData.breakdown,
          driving: rawData.driving
            ? {
                distance: rawData.driving?.runDistance,
                startCount: rawData.driving?.engineStartCount,
                durations: {
                  idle: rawData.driving?.engineIdleTime,
                  drive: rawData.driving?.engineOnTime,
                },
              }
            : undefined,
          vehicleStatus: rawData.vehicleStatus
            ? {
                tpms: rawData.vehicleStatus?.tpmsSupport
                  ? Boolean(rawData.vehicleStatus?.tpmsSupport)
                  : undefined,
                tirePressure: {
                  all: rawData.vehicleStatus?.tirePressure?.tirePressureLampAll == '1',
                },
              }
            : undefined,
        };
      }
      return;
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.monthyReports');
    }
  }

  public async tripInfo(date: {
    year: number;
    month: number;
    day: number;
  }): Promise<DeepPartial<VehicleDayTrip>[] | undefined>;
  public async tripInfo(date?: {
    year: number;
    month: number;
  }): Promise<DeepPartial<VehicleMonthTrip> | undefined>;

  public async tripInfo(
    date: { year: number; month: number; day?: number } = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    }
  ): Promise<DeepPartial<VehicleDayTrip>[] | DeepPartial<VehicleMonthTrip> | undefined> {
    const http = await this.controller.getApiHttpService();
    try {
      const perDay = Boolean(date.day);
      const response = this.updateRates(
        await http.post(`/api/v1/spa/vehicles/${this.vehicleConfig.id}/tripinfo`, {
          body: {
            setTripLatest: 10,
            setTripMonth: !perDay ? toMonthDate(date) : undefined,
            setTripDay: perDay ? toDayDate(date) : undefined,
            tripPeriodType: perDay ? 1 : 0,
          },
        })
      );

      if (!perDay) {
        const rawData = response.body.resMsg;
        return {
          days: Array.isArray(rawData?.tripDayList)
            ? rawData?.tripDayList.map(day => ({
                dayRaw: day.tripDayInMonth,
                date: day.tripDayInMonth ? parseDate(day.tripDayInMonth) : undefined,
                tripsCount: day.tripCntDay,
              }))
            : [],
          durations: {
            drive: rawData?.tripDrvTime,
            idle: rawData?.tripIdleTime,
          },
          distance: rawData?.tripDist,
          speed: {
            avg: rawData?.tripAvgSpeed,
            max: rawData?.tripMaxSpeed,
          },
        } as VehicleMonthTrip;
      } else {
        const rawData = response.body.resMsg.dayTripList;
        if (rawData && Array.isArray(rawData)) {
          return rawData.map(day => ({
            dayRaw: day.tripDay,
            tripsCount: day.dayTripCnt,
            distance: day.tripDist,
            durations: {
              drive: day.tripDrvTime,
              idle: day.tripIdleTime,
            },
            speed: {
              avg: day.tripAvgSpeed,
              max: day.tripMaxSpeed,
            },
            trips: Array.isArray(day.tripList)
              ? day.tripList.map(trip => {
                  const start = parseDate(`${day.tripDay}${trip.tripTime}`);
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
      }
      return;
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.history');
    }
  }

  public async driveHistory(period: historyDrivingPeriod = historyDrivingPeriod.DAY): Promise<
    DeepPartial<{
      cumulated: CNDriveHistory[];
      history: CNDatedDriveHistory[];
    }>
  > {
    const http = await this.controller.getApiHttpService();
    try {
      const response = await http.post(`/api/v1/spa/vehicles/${this.vehicleConfig.id}/drvhistory`, {
        body: {
          periodTarget: period,
        },
      });
      return {
        cumulated: response.body.resMsg.drivingInfo?.map(line => ({
          period: line.drivingPeriod,
          consumption: {
            total: line.totalPwrCsp,
            engine: line.motorPwrCsp,
            climate: line.climatePwrCsp,
            devices: line.eDPwrCsp,
            battery: line.batteryMgPwrCsp,
          },
          regen: line.regenPwr,
          distance: line.calculativeOdo,
        })),
        history: response.body.resMsg.drivingInfoDetail?.map(line => ({
          period: line.drivingPeriod,
          rawDate: line.drivingDate,
          date: line.drivingDate ? parseDate(line.drivingDate) : undefined,
          consumption: {
            total: line.totalPwrCsp,
            engine: line.motorPwrCsp,
            climate: line.climatePwrCsp,
            devices: line.eDPwrCsp,
            battery: line.batteryMgPwrCsp,
          },
          regen: line.regenPwr,
          distance: line.calculativeOdo,
        })),
      };
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.history');
    }
  }

  /**
   * Warning: Only works on EV
   */
  public async getChargeTargets(): Promise<DeepPartial<VehicleTargetSOC>[] | undefined> {
    const http = await this.controller.getVehicleHttpService();
    try {
      const response = this.updateRates(
        await http.get(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/charge/target`)
      );
      const rawData = response.body.resMsg?.targetSOClist;
      if (rawData && Array.isArray(rawData)) {
        return rawData.map(rawSOC => ({
          distance: rawSOC.drvDistance?.distanceType?.distanceValue,
          targetLevel: rawSOC.targetSOClevel,
          type: rawSOC.plugType,
        }));
      }
      return;
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.getChargeTargets');
    }
  }

  /**
   * Warning: Only works on EV
   */
  public async setChargeTargets(limits: { fast: ChargeTarget; slow: ChargeTarget }): Promise<void> {
    const http = await this.controller.getVehicleHttpService();
    if (
      !POSSIBLE_CHARGE_LIMIT_VALUES.includes(limits.fast) ||
      !POSSIBLE_CHARGE_LIMIT_VALUES.includes(limits.slow)
    ) {
      throw new ManagedBluelinkyError(
        `Charge target values are limited to ${POSSIBLE_CHARGE_LIMIT_VALUES.join(', ')}`
      );
    }
    try {
      this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/charge/target`, {
          body: {
            targetSOClist: [
              { plugType: EVChargeModeTypes.FAST, targetSOClevel: limits.fast },
              { plugType: EVChargeModeTypes.SLOW, targetSOClevel: limits.slow },
            ],
          },
        })
      );
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.setChargeTargets');
    }
  }

  /**
   * Define a navigation route
   * @param poiInformations The list of POIs and waypoint to go through
   */
  public async setNavigation(poiInformations: CNPOIInformation[]): Promise<void> {
    const http = await this.controller.getVehicleHttpService();
    try {
      this.updateRates(
        await http.post(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/location/routes`, {
          body: {
            deviceID: this.controller.session.deviceId,
            poiInfoList: poiInformations,
          },
        })
      );
    } catch (err) {
      throw manageBluelinkyError(err, 'ChinaVehicle.setNavigation');
    }
  }

  private updateRates<T extends Record<string, unknown>>(resp: got.Response<T>): got.Response<T> {
    if (resp.headers?.['x-ratelimit-limit']) {
      this.serverRates.max = Number(resp.headers?.['x-ratelimit-limit']);
      this.serverRates.current = Number(resp.headers?.['x-ratelimit-remaining']);
      if (resp.headers?.['x-ratelimit-reset']) {
        this.serverRates.reset = new Date(Number(`${resp.headers?.['x-ratelimit-reset']}000`));
      }
      this.serverRates.updatedAt = new Date();
    }
    return resp;
  }
}

function toMonthDate(month: { year: number; month: number }) {
  return `${month.year}${month.month.toString().padStart(2, '0')}`;
}

function toDayDate(date: { year: number; month: number; day?: number }) {
  return date.day
    ? `${toMonthDate(date)}${date.day.toString().padStart(2, '0')}`
    : toMonthDate(date);
}
