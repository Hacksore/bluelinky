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

  get location(): VehicleLocation | null {
    throw new Error('Method not implemented.');
  }
  get odometer(): Odometer | null {
    throw new Error('Method not implemented.');
  }

  get gen(): string {
    throw new Error('Method not implemented.');
  }

  get vin(): string {
    return this.config.vin;
  }

  get name(): string {
    return this.config.nickname;
  }

  get vinNumber(): string {
    return '';
  }

  get type(): string {
    return this.type;
  }

  public async start(startConfig: StartConfig): Promise<string> {
    const mergedConfig = {
      ...{
        airCtrl: false,
        igniOnDuration: 10,
        airTempvalue: 70,
        defrost: false,
        heating1: false
      },
      ...startConfig,
    }

    const response = await got(`${BASE_URL}/ac/v2/rcs/rsc/start`, {
      method: 'POST',
      headers: {
        'ACCESS_TOKEN': this.controller.session.accessToken,
        'CLIENT_ID': CLIENT_ID,
        'User-Agent': 'okhttp/3.12.0',
        'VIN': this.config.vin,
        'LANGUAGE': '0',
        'TO': 'ISS',
        'FROM': 'SPA',        
        'OFFSET': '-5',
        'blueLinkServicePin': this.controller.config.pin
      },
      body: {
        "Ims": 0,
        "airCtrl": mergedConfig.airCtrl,
        "airTemp": {
          "unit": 1,
          "value": mergedConfig.airTempvalue
        },
        "defrost": mergedConfig.defrost,
        "heating1": mergedConfig.heating1,
        "igniOnDuration": mergedConfig.igniOnDuration,
        "seatHeaterVentInfo": null, // need to figure out what this is
        "username": this.controller.config.username,
        "vin": this.config.vin
      },
      json: true
    });

    logger.debug(JSON.stringify(response));
    return Promise.resolve('all good');
  }

  public async stop(): Promise<string> {
    const response = await got(`${BASE_URL}/ac/v2/rcs/rsc/stop`, {
      method: 'POST',
      headers: {
        'ACCESS_TOKEN': this.controller.session.accessToken,
        'CLIENT_ID': CLIENT_ID,
        'User-Agent': 'okhttp/3.12.0',
        'VIN': this.config.vin,
        'LANGUAGE': '0',
        'TO': 'ISS',
        'FROM': 'SPA',        
        'OFFSET': '-5',
        'blueLinkServicePin': this.controller.config.pin
      }
    });
    logger.debug(JSON.stringify(response));
    return Promise.resolve('all good');
  }

  public async status(refresh = false): Promise<VehicleStatus> {
    const response = await got(`${BASE_URL}/ac/v2/rcs/rvs/vehicleStatus`, {
      method: 'GET',
      headers: {
        'REFRESH': refresh.toString(),
        'ACCESS_TOKEN': this.controller.session.accessToken,
        'CLIENT_ID': CLIENT_ID,
        'VIN': this.config.vin,
        'User-Agent': 'okhttp/3.12.0',
        'LANGUAGE': '0',
        'TO': 'ISS',
        'FROM': 'SPA',
        'OFFSET': '-5'
      }
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
      headers: {
        'access_token': this.controller.session.accessToken,
        'Client_Id': CLIENT_ID,
        'Host': API_HOST,
        'requestId': '40',
        'User-Agent': 'okhttp/3.12.0',
        'registrationId': this.config.regId,
        'gen': this.config.gen,
        'blueLinkServicePin': this.controller.config.pin,
        'username': this.controller.config.username,
        'VIN': this.config.vin,
        'APPCLOUD-VIN': this.config.vin,
        'Language': '0',
        'To': 'ISS',
        'encryptFlag': 'false',
        'From': 'SPA',
        'brandIndecator': this.config.brandIndecator,
        'Offset': '-5'
      },
      body: formData.toString()
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
      headers: {
        'access_token': this.controller.session.accessToken,
        'Client_Id': CLIENT_ID,
        'Host': API_HOST,
        'requestId': '40',
        'User-Agent': 'okhttp/3.12.0',
        'registrationId': this.config.regId,
        'gen': this.config.gen,
        'blueLinkServicePin': this.controller.config.pin,
        'username': this.controller.config.username,
        'VIN': this.config.vin,
        'APPCLOUD-VIN': this.config.vin,
        'Language': '0',
        'To': 'ISS',
        'encryptFlag': 'false',
        'From': 'SPA',
        'brandIndecator': this.config.brandIndecator,
        'Offset': '-5'
      },
      body: formData.toString()
    });

    if (response.statusCode === 200) {
      return Promise.resolve('Lock successful');  
    }

    return Promise.reject('Something went wrong!');  
  }

}
