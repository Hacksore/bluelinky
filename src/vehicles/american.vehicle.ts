import got from 'got';
import logger from '../logger';

import { REGIONS, DEFAULT_VEHICLE_STATUS_OPTIONS } from '../constants';

import {
  VehicleStartOptions,
  VehicleStatus,
  VehicleLocation,
  VehicleRegisterOptions,
  VehicleOdometer,
  RawVehicleStatus,
  VehicleStatusOptions,
  FullVehicleStatus,
  SeatHeaterVentInfo
} from '../interfaces/common.interfaces';
import { RequestHeaders } from '../interfaces/american.interfaces';

import { Vehicle } from './vehicle';
import { URLSearchParams } from 'url';
import { AmericanController } from '../controllers/american.controller';
import { advClimateValidator } from '../constants/seatheatvent';
export default class AmericanVehicle extends Vehicle {
  public region = REGIONS.US;

  constructor(public vehicleConfig: VehicleRegisterOptions, public controller: AmericanController) {
    super(vehicleConfig, controller);
    logger.debug(`US Vehicle ${this.vehicleConfig.regId} created`);
  }

  private getDefaultHeaders(): RequestHeaders {
    return {
      'access_token': this.controller.session.accessToken,
      'client_id': this.controller.environment.clientId,
      'Host': this.controller.environment.host,
      'User-Agent': 'okhttp/3.12.0',
      'registrationId': this.vehicleConfig.regId,
      'gen': this.vehicleConfig.generation,
      'username': this.userConfig.username,
      'vin': this.vehicleConfig.vin,
      'APPCLOUD-VIN': this.vehicleConfig.vin,
      'Language': '0',
      'to': 'ISS',
      'encryptFlag': 'false',
      'from': 'SPA',
      'brandIndicator': this.vehicleConfig.brandIndicator,
      'bluelinkservicepin': this.userConfig.pin,
      'offset': '-5',
    };
  }

  public fullStatus(): Promise<FullVehicleStatus | null> {
    throw new Error('Method not implemented.');
  }

  public async odometer(): Promise<VehicleOdometer | null> {
    const response = await this._request(`/ac/v2/enrollment/details/${this.userConfig.username}`, {
      method: 'GET',
      headers: { ...this.getDefaultHeaders() },
    });

    if (response.statusCode !== 200) {
      throw 'Failed to get odometer reading!';
    }
    const data = JSON.parse(response.body);
    const foundVehicle = data.enrolledVehicleDetails.find(item => {
      return item.vehicleDetails.vin === this.vin();
    });

    this._odometer = {
      value: foundVehicle.vehicleDetails.odometer,
      unit: 0, // unsure what this is :P
    };

    return this._odometer;
  }

  /**
   * This is seems to always poll the modem directly, no caching
   */
  public async location(): Promise<VehicleLocation> {
    const response = await this._request('/ac/v2/rcs/rfc/findMyCar', {
      method: 'GET',
      headers: { ...this.getDefaultHeaders() },
    });

    if (response.statusCode !== 200) {
      throw 'Failed to get location!';
    }

    const data = JSON.parse(response.body);
    return {
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      altitude: data.coord.alt,
      speed: {
        unit: data.speed.unit,
        value: data.speed.value,
      },
      heading: data.head,
    };
  }

  public async start(startConfig: VehicleStartOptions): Promise<string> {
    logger.debug('try start: ', JSON.stringify(startConfig));
    let seatClimateOptions: SeatHeaterVentInfo = null;
    let gen2ev = false;
    const mergedConfig = {
      ...{
        hvac: false,
        duration: 10,
        temperature: 70,
        defrost: false,
        heatedFeatures: 0,
        unit: 'F',
        seatClimateSettings: seatClimateOptions
      } as VehicleStartOptions,
      ...startConfig,
    };

    logger.debug(`mergedConfig:  ${JSON.stringify(mergedConfig)}`);
    const advClimateOptionValidator = advClimateValidator(this.userConfig.brand, this.region);
    logger.debug(`advClimateOptionValidator: ${JSON.stringify(advClimateOptionValidator)}`);

    let start_url = 'ac/v2/rcs/rsc/start';
    if (this.vehicleConfig.engineType === 'EV') {
      start_url = 'ac/v2/evc/fatc/start';
      if (this.vehicleConfig.generation == '2') {
        gen2ev = true;
        logger.debug('gen2 EV vehicle - seat and climate duration options not supported');
      }
    }
    logger.debug(`Using start URL: ${start_url}`);

    //keeping heate dFeatures backwards compatible
    if (typeof mergedConfig.heatedFeatures === 'boolean') {
      mergedConfig.heatedFeatures = mergedConfig.heatedFeatures ? 1 : 0;
      logger.warn('heatedFeatures was boolean; is actually enum; please update code to use enum values');
    } else if (typeof mergedConfig.heatedFeatures === 'number') {
      if (advClimateOptionValidator.validHeats.includes(mergedConfig.heatedFeatures)) {
        mergedConfig.heatedFeatures = advClimateOptionValidator.validHeats[mergedConfig.heatedFeatures];
      } else {
        logger.warn('heatedFeatures is not a valid enum, defaulting to 0');
        mergedConfig.heatedFeatures = 0; // default to 0 if not valid
      }
    } else {
      logger.warn('heatedFeatures is not a number or boolean, defaulting to 0');
      mergedConfig.heatedFeatures = 0;
    }

    //processing seatClimateSettings
    const result = {} as SeatHeaterVentInfo;
    if (mergedConfig.seatClimateSettings && !gen2ev) {
      const controlled_seats = Object.keys(mergedConfig.seatClimateSettings);
      if (controlled_seats.length > 0) {
        logger.debug(`Seat climate settings found: ${JSON.stringify(mergedConfig.seatClimateSettings)}`);
        controlled_seats.forEach((seat) => {
          const targetSeat = advClimateOptionValidator.validSeats[seat] ? advClimateOptionValidator.validSeats[seat] : null;
          const seatStatus = advClimateOptionValidator.validStatus.includes(mergedConfig.seatClimateSettings![seat]) ? mergedConfig.seatClimateSettings![seat] : null;
          if (targetSeat && seatStatus) {
            result![targetSeat] = seatStatus;
          } else {
            logger.warn(`invalid seat / seat climate option for ${seat}`);
          }
        });
        // logger.debug(`Processed Climate Seat Options result: ${JSON.stringify(result)}`);
      } else {
        logger.warn('invalid seatClimateSettings provided, defaulting to null');
      }
    } else {
      logger.debug('no seatClimateSettings found / gen 2 ev');
    }
    // if after processing result is empty, default seatClimateOptions to null
    Object.keys(result!).length > 0 ? seatClimateOptions = result : seatClimateOptions = null;
    logger.debug(`Processed seatClimateOptions: ${JSON.stringify(seatClimateOptions)}`);

    // using ... spread syntax to conditionally build body at the end 
    // avoids typescript's *ahem* nuances with changing things conditionally
    const body = {
      'Ims': 0,
      'airCtrl': +mergedConfig.hvac, // use the unary method to convert to int
      'airTemp': {
        'unit': 1,
        'value': `${mergedConfig.temperature}`,
      },
      'defrost': mergedConfig.defrost,
      'heating1': mergedConfig.heatedFeatures, // default to Off if not valid
      ...(!gen2ev && { //gen2ev does not support duration or seatClimateOptions
        'igniOnDuration': mergedConfig.duration,
        'seatHeaterVentInfo': seatClimateOptions,  // figured out what it is
      }),
      'username': this.userConfig.username,
      'vin': this.vehicleConfig.vin,
    };

    logger.debug(`starting car with payload: ${JSON.stringify(body)}`);

    const response = await this._request(start_url, {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(),
        'offset': '-4',
      },
      body: body,
      json: true,
    });

    if (response.statusCode === 200) {
      logger.debug(`Vehicle started successfully: ${response.body}`);
      return 'Vehicle started!';
    }

    logger.error(`Failed to start vehicle: ${response.body}`);
    return 'Failed to start vehicle';
  }

  public async stop(): Promise<string> {
    const response = await this._request('/ac/v2/rcs/rsc/stop', {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(),
        'offset': '-4',
      },
    });

    if (response.statusCode === 200) {
      return 'Vehicle stopped';
    }

    throw 'Failed to stop vehicle!';
  }

  public async status(
    input: VehicleStatusOptions
  ): Promise<VehicleStatus | RawVehicleStatus | null> {
    const statusConfig = {
      ...DEFAULT_VEHICLE_STATUS_OPTIONS,
      ...input,
    };

    const response = await this._request('/ac/v2/rcs/rvs/vehicleStatus', {
      method: 'GET',
      headers: {
        'REFRESH': statusConfig.refresh.toString(),
        ...this.getDefaultHeaders(),
      },
    });

    const { vehicleStatus } = JSON.parse(response.body);
    const parsedStatus: VehicleStatus = {
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
      engine: {
        ignition: vehicleStatus?.engine,
        accessory: vehicleStatus?.acc,
        // try ev range first then fallback to ice range
        range:
          vehicleStatus?.evStatus?.drvDistance[0]?.rangeByFuel?.totalAvailableRange?.value ||
          vehicleStatus?.dte?.value,
        charging: vehicleStatus?.evStatus?.batteryCharge,
        batteryCharge12v: vehicleStatus?.battery?.batSoc,
        batteryChargeHV: vehicleStatus?.evStatus?.batteryStatus,
      },
      lastupdate: new Date(vehicleStatus?.dateTime),
    };

    this._status = statusConfig.parsed ? parsedStatus : vehicleStatus;

    return this._status;
  }

  public async unlock(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('userName', this.userConfig.username || '');
    formData.append('vin', this.vehicleConfig.vin);

    const response = await this._request('/ac/v2/rcs/rdo/on', {
      method: 'POST',
      headers: { ...this.getDefaultHeaders() },
      body: formData.toString(),
    });

    if (response.statusCode === 200) {
      return 'Unlock successful';
    }

    return 'Something went wrong!';
  }

  public async lock(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('userName', this.userConfig.username || '');
    formData.append('vin', this.vehicleConfig.vin);

    const response = await this._request('/ac/v2/rcs/rdo/off', {
      method: 'POST',
      headers: { ...this.getDefaultHeaders() },
      body: formData.toString(),
    });

    if (response.statusCode === 200) {
      return 'Lock successful';
    }

    return 'Something went wrong!';
  }

  public async startCharge(): Promise<string> {
    const response = await this._request(
      `/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`,
      {
        method: 'POST',
      }
    );

    if (response.statusCode === 200) {
      logger.debug(`Send start charge command to Vehicle ${this.vehicleConfig.id}`);
      return 'Start charge successful';
    }

    throw 'Something went wrong!';
  }

  public async stopCharge(): Promise<string> {
    const response = await got(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`, {
      method: 'POST',
    });

    if (response.statusCode === 200) {
      logger.debug(`Send stop charge command to vehicle ${this.vehicleConfig.id}`);
      return 'Stop charge successful';
    }

    throw 'Something went wrong!';
  }

  // TODO: not sure how to type a dynamic response
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private async _request(service: string, options): Promise<got.Response<any>> {
    // add logic for token refresh if to ensure we don't use a stale token
    await this.controller.refreshAccessToken();

    // if we refreshed token make sure to apply it to the request
    options.headers.access_token = this.controller.session.accessToken;

    const response = await got(`${this.controller.environment.baseUrl}/${service}`, {
      throwHttpErrors: false,
      ...options,
    });

    if (response?.body) {
      logger.debug(response.body);
    }

    return response;
  }
}
