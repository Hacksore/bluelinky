import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
import got from 'got';
import { Vehicle } from '../vehicles/vehicle';
import AmericanVehicle from '../vehicles/americanVehicle';
import SessionController from './controller';

import logger from '../logger';
import { BASE_URL, CLIENT_ID, CLIENT_SECRET, API_HOST } from '../constants/america';

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

  public async refreshAccessToken(): Promise<string> {
    // Seems as of now we can just request a whole new access_token
    // but the proper oauth flow would be to use the refresh_token :)
    return this.login();
  }

  public async login(): Promise<string> {
    try {
      const response = await got(`${BASE_URL}/v2/ac/oauth/token`, {
        method: 'POST',
        body: {
          username: this.config.username,
          password: this.config.password
        },
        headers: {
          'client_secret': CLIENT_SECRET,
          'client_id': CLIENT_ID
        },
        json: true
      });  

      this.session.accessToken = response.body.access_token;
      this.session.refreshToken = response.body.refresh_token;

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

    const response = await got(`${BASE_URL}/ac/v2/enrollment/details/${this.config.username}`, {
      method: 'GET',
      headers: {
        'access_token': this.session.accessToken,
        'client_id': CLIENT_ID,
        'Host': API_HOST,
        'User-Agent': 'okhttp/3.12.0',
        'payloadGenerated': '20200226171938',
        'includeNonConnectedVehicles': 'Y'
      }
    });

    const data = JSON.parse(response.body);

    if (data.enrolledVehicleDetails === undefined) {
      this.vehicles = [];
      return Promise.reject('No vehicles found for account!');
    }

    data.enrolledVehicleDetails.forEach(vehicle => {
      const vehicleInfo = vehicle.vehicleDetails;
    
      const config = {
        nickname: vehicleInfo.nickName,
        vin: vehicleInfo.vin,
        regDate: vehicleInfo.enrollmentDate,
        brandIndicator: vehicleInfo.brandIndicator,
        regId: vehicleInfo.regid,
        // unsure if this is right but the new endpoint does not seem to have gen        
        gen: vehicleInfo.modelYear > 2016 ? 2 : 1,
        name: vehicleInfo.nickName
      }
      this.vehicles.push(new AmericanVehicle(config, this.session));
    });

    return Promise.resolve(this.vehicles);
  }
}
