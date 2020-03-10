import { REGIONS } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';

import logger from '../logger';
import { Vehicle } from './vehicle';
import got from 'got';
import { BASE_URL, CLIENT_ID, API_HOST } from '../constants/america';
import { URLSearchParams } from 'url';
import { StartConfig } from '../interfaces/american.interfaces';

export default class AmericanVehicle extends Vehicle {
  private _status: VehicleStatus | null = null;
  public region = REGIONS.US;

  constructor(public config, public controller) {
    super(controller);
    logger.info(`US Vehicle ${this.config.regId} created`);
  }

  get odometer(): Odometer | null {
    throw new Error('Method not implemented.');
  }

  get gen(): string {
    return this.config.gen;
  }

  get vin(): string {
    return this.config.vin;
  }

  get vehicleId(): string {
    return this.config.vehicleId;
  }

  get name(): string {
    return this.config.nickname;
  }

  get type(): string {
    return this.type;
  }

  get location(): VehicleLocation {
    throw new Error('Method not implemented.');
  }

  // common headers used by most methods
  // TODO: type this
  private getHeaders(): any {
    return {
      'access_token': this.controller.session.accessToken,
      'client_id': CLIENT_ID,
      'Host': API_HOST,
      'User-Agent': 'okhttp/3.12.0',
      'registrationId': this.config.regId,
      'gen': this.config.gen,
      'username': this.controller.config.username,
      'vin': this.config.vin,
      'APPCLOUD-VIN': this.config.vin,
      'Language': '0',
      'to': 'ISS',
      'encryptFlag': 'false',
      'from': 'SPA',
      'brandIndicator': this.config.brandIndicator,
      'bluelinkservicepin': this.controller.config.pin,
      'offset': '-5',
    };
  }

  public async getLocation(): Promise<VehicleStatus | null> {
    const response = await got(`${BASE_URL}/ac/v2/rcs/rfc/findMyCar`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    logger.debug(JSON.stringify(response.body));
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      return Promise.resolve(data);
    }

    return Promise.reject('Failed to stop vehicle!');
  }

  /**
   * This will attempt to remote start the vehicle
   * @param startConfig Object of properties used to pass to API
   */
  public async start(startConfig: StartConfig): Promise<string> {
    const mergedConfig = {
      ...{
        airCtrl: false,
        igniOnDuration: 10,
        airTempvalue: '70',
        defrost: false,
        heating1: false,
      },
      ...startConfig,
    };

    const body = {
      'Ims': 0,
      'airCtrl': + mergedConfig.airCtrl, // use the unary method to convert to int
      'airTemp': {
        'unit': 1,
        'value': `${mergedConfig.airTempvalue}`,
      },
      'defrost': mergedConfig.defrost,
      'heating1': + mergedConfig.heating1, // use the unary method to convert to int
      'igniOnDuration': mergedConfig.igniOnDuration,
      'seatHeaterVentInfo': null, // need to figure out what this is
      'username': this.controller.config.username,
      'vin': this.config.vin,
    };

    const response = await got(`${BASE_URL}/ac/v2/rcs/rsc/start`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'offset': '-4',
      },
      body: body,
      json: true,
    });

    // logger.debug(JSON.stringify(response.body));

    if (response.statusCode === 200) {
      return Promise.resolve('Vehicle started!');
    }

    return Promise.reject('Failed to start vehicle');
  }

  public async stop(): Promise<string> {
    const response = await got(`${BASE_URL}/ac/v2/rcs/rsc/stop`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    logger.debug(JSON.stringify(response));
    if (response.statusCode === 200) {
      return Promise.resolve('all good');
    }

    return Promise.reject('Failed to stop vehicle!');
  }

  public async status(refresh = false): Promise<VehicleStatus> {
    const response = await got(`${BASE_URL}/ac/v2/rcs/rvs/vehicleStatus`, {
      method: 'GET',
      headers: {
        'REFRESH': refresh.toString(),
        ...this.getHeaders(),
      },
    });

    const data = JSON.parse(response.body);
    this._status = data.vehicleStatus as VehicleStatus;
    return Promise.resolve(data.vehicleStatus as VehicleStatus);
  }

  public async unlock(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('userName', this.controller.config.username);
    formData.append('vin', this.config.vin);

    const response = await got(`${BASE_URL}/ac/v2/rcs/rdo/on`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData.toString(),
    });

    if (response.statusCode === 200) {
      return Promise.resolve('Unlock successful');
    }

    return Promise.reject('Something went wrong!');
  }

  public async lock(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('userName', this.controller.config.username);
    formData.append('vin', this.config.vin);

    const response = await got(`${BASE_URL}/ac/v2/rcs/rdo/off`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData.toString(),
    });

    if (response.statusCode === 200) {
      return Promise.resolve('Lock successful');
    }

    return Promise.reject('Something went wrong!');
  }
}
