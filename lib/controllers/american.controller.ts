import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import got from 'got';
import { US_ENDPOINTS } from '../constants';
import { Vehicle } from '../vehicles/vehicle';
import AmericanVehicle from '../vehicles/americanVehicle';
import SessionController from './controller';

import logger from '../logger';

export class AmericanController implements SessionController {
  constructor(config: BlueLinkyConfig) {
    this.config = config;
    logger.info(`${this.config.region} Controller created`);
  }

  session: Session = {
    accessToken: '',
    refreshToken: '',
    controlToken: '',
    deviceId: '',
  };

  private vehicles: Array<AmericanVehicle> = [];

  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: 'US',
    vin: null,
    autoLogin: true,
    pin: null,
    deviceUuid: null,
  };

  async refreshAccessToken(): Promise<string> {
    return this.login();
  }

  async login(): Promise<string> {
    try {
      const response = await got('https://api.telematics.hyundaiusa.com/v2/ac/oauth/token', {
        method: 'POST',
        body: {
          username: this.config.username,
          password: this.config.password
        },
        headers: {
          'client_secret': 'GXZveJJAVTehh/OtakM3EQ==',
          'client_id': '815c046afaa4471aa578827ad546cc76'
        },
        json: true
      });
      // console.log(response.body);

      this.session.accessToken = response.body.access_token; 

      return Promise.resolve('');
    } catch (err) {
      console.log(err);
      Promise.reject('error')
    }

    return Promise.reject('idk');
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  async getVehicles(): Promise<Array<Vehicle>> {

    const response = await got('https://api.telematics.hyundaiusa.com/ac/v2/enrollment/details/' + this.config.username, {
      method: 'GET',
      headers: {
        'access_token': this.session.accessToken,
        'client_id': '815c046afaa4471aa578827ad546cc76',
        'Host': 'api.telematics.hyundaiusa.com',
        'User-Agent': 'okhttp/3.12.0',
        'payloadGenerated': '20200226171938',
        'includeNonConnectedVehicles': 'Y'
      }
    });

    const data = JSON.parse(response.body);
   
    data.enrolledVehicleDetails.forEach(vehicle => {
      const vehicleInfo = vehicle.vehicleDetails;
      const config = {
        master: 'wot',
        nickname: vehicleInfo.nickName,
        vin: vehicleInfo.vin,
        regDate: vehicleInfo.enrollmentDate,
        type: 'wot',
        brandIndicator: vehicleInfo.brandIndicator,
        regId: vehicleInfo.regid,
        gen: vehicleInfo.modelYear > 2017 ? 2 : 1,
        name: vehicleInfo.nickName
      }
      this.vehicles.push(new AmericanVehicle(config, this.session));
    });

    return Promise.resolve(this.vehicles);
  }
}
