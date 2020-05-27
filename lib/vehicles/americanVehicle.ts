import got from 'got';
import logger from '../logger';

import { REGIONS } from '../constants';
import { BASE_URL, CLIENT_ID, API_HOST } from '../constants/america';
import { SessionController } from '../controllers/controller';

import {
  StartConfig,
  VehicleStatus,
  VehicleLocation,
  RegisterVehicleConfig,
  Odometer,
} from '../interfaces/common.interfaces';
import { RequestHeaders, VehicleConfig } from '../interfaces/american.interfaces';

import { Vehicle } from './vehicle';
import { URLSearchParams } from 'url';

export default class AmericanVehicle extends Vehicle {
  public region = REGIONS.US;
  private _stats: VehicleConfig | null = null;

  constructor(public vehicleConfig: RegisterVehicleConfig, public controller: SessionController) {
    super(vehicleConfig, controller);
    logger.info(`US Vehicle ${this.vehicleConfig.id} created`);
  }

  private getDefaultHeaders(): RequestHeaders {
    return {
      'access_token': this.controller.session.accessToken,
      'client_id': CLIENT_ID,
      'Host': API_HOST,
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

  public async odometer(): Promise<Odometer | null> {
    const response = await this._request(`/ac/v2/enrollment/details/${this.userConfig.username}`, {
      method: 'GET',
      headers: { ...this.getDefaultHeaders() },
    });

    if (response.statusCode !== 200) {
      return Promise.reject('Failed to get odometer reading!');
    }
    const data = JSON.parse(response.body);
    const foundVehicle = data.enrolledVehicleDetails.find((item) => {
      return item.vehicleDetails.vin === this.vin();
    });

    return Promise.resolve({
      value: foundVehicle.vehicleDetails.odometer,
      unit: 0, // unsure what this is :P
    });
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
      return Promise.reject('Failed to get location!');
    }

    const data = JSON.parse(response.body);
    return Promise.resolve({
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      altitude: data.coord.alt,
      speed: {
        unit: data.speed.unit,
        value: data.speed.value,
      },
      heading: data.head,
    });
  }

  public async start(startConfig: StartConfig): Promise<string> {
    const mergedConfig = {
      ...{
        airCtrl: false,
        igniOnDuration: 10,
        airTempvalue: 70,
        defrost: false,
        heating1: false,
      },
      ...startConfig,
    };

    const body = {
      'Ims': 0,
      'airCtrl': +mergedConfig.airCtrl, // use the unary method to convert to int
      'airTemp': {
        'unit': 1,
        'value': `${mergedConfig.airTempvalue}`,
      },
      'defrost': mergedConfig.defrost,
      'heating1': +mergedConfig.heating1, // use the unary method to convert to int
      'igniOnDuration': mergedConfig.igniOnDuration,
      'seatHeaterVentInfo': null, // need to figure out what this is
      'username': this.userConfig.username,
      'vin': this.vehicleConfig.vin,
    };

    const response = await this._request('/ac/v2/rcs/rsc/start', {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(),
        'offset': '-4',
      },
      body: body,
      json: true,
    });

    if (response.statusCode === 200) {
      return Promise.resolve('Vehicle started!');
    }

    return Promise.reject('Failed to start vehicle');
  }

  public async stop(): Promise<string> {
    const response = await this._request(`${BASE_URL}/ac/v2/rcs/rsc/stop`, {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(),
        'offset': '-4',
      },
    });

    if (response.statusCode === 200) {
      return Promise.resolve('Vehicle stopped');
    }

    return Promise.reject('Failed to stop vehicle!');
  }

  public async status(refresh = false): Promise<VehicleStatus> {
    const response = await this._request('/ac/v2/rcs/rvs/vehicleStatus', {
      method: 'GET',
      headers: {
        'REFRESH': refresh.toString(),
        ...this.getDefaultHeaders(),
      },
    });

    const { vehicleStatus } = JSON.parse(response.body);
    this._stats = vehicleStatus;

    return Promise.resolve({
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
          rearLeft: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampRearLeft,
          frontLeft: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampFrontLeft,
          frontRight: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampFrontRight,
          rearRight: !!vehicleStatus.tirePressureLamp.tirePressureWarningLampRearRight,
          all: !!vehicleStatus.tirePressureLamp.trunkOpenStatus,
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
      },
    });
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
      return Promise.resolve('Unlock successful');
    }

    return Promise.reject('Something went wrong!');
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
      return Promise.resolve('Lock successful');
    }

    return Promise.reject('Something went wrong!');
  }

  // TODO: not sure how to type a dynamic response
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private async _request(service: string, options): Promise<got.Response<any>> {
    const currentTime = Math.floor(+new Date() / 1000);
    const tokenDelta = -(currentTime - this.controller.session.tokenExpiresAt);

    // token will epxire in 60 seconds, let's refresh it before that
    if (tokenDelta <= 60) {
      logger.debug("Token is expiring soon, let's get a new one");
      await this.controller.refreshAccessToken();
    } else {
      logger.debug('Token is all good, moving on!');
    }

    const response = await got(`${BASE_URL}/${service}`, options);
    logger.debug(JSON.stringify(response.body));

    return Promise.resolve(response);
  }
}
