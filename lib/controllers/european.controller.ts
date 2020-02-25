import { BlueLinkyConfig, Session } from './../interfaces/common.interfaces';
// import fetch from 'node-fetch';
import got from 'got';
import * as https from 'https';
import { ALL_ENDPOINTS } from '../constants';
import { Logger } from 'winston';
import { Vehicle } from '../vehicles/vehicle';
import EuropeanVehicle from '../vehicles/europianVehicle';
import SessionController from './controller';

export class EuropeanController extends SessionController {

  constructor(private logger: Logger, config: BlueLinkyConfig) {
    super();
    this.config = config;
    logger.info(`${this.config.region} Controller created`);
  }

  session: Session = {
    accessToken: '',
    controlToken: '',
    deviceId: 'c0e238b4-c0de-488c-9eee-caa6c74035a1',
  };

  private vehicles: Array<EuropeanVehicle> = [];

  public config: BlueLinkyConfig = {
    username: null,
    password: null,
    region: 'EU',
    autoLogin: true,
    pin: null
  };

  async enterPin(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if(this.session.accessToken !== '') {
          const response = await got('https://prd.eu-ccapi.hyundai.com:8080/api/v1/user/pin', {
            method: 'PUT',
            headers: {
              'Authorization': this.session.accessToken,
              'Content-Type': 'application/json'
            },
            body: {
              deviceId: this.session.deviceId,
              pin: this.config.pin
            },
            json: true
          });

          this.session.controlToken = 'Bearer ' + response.body.controlToken;
          setTimeout(() => {
              this.session.controlToken = '';
              console.log('Control token timed out!');
          }, response.body.expiresTime * 1000);
          resolve('PIN Entered OK');
      } else {
          reject('Token not set');
      }
    });
  }

  async login() {
    return new Promise<string>(async (resolve, reject) => {
      let CookieHeader = '';

      try {
        await new Promise((_resolve, reject) => {
          https.get(ALL_ENDPOINTS.EU.session, res => {
            if (res.headers['set-cookie'] !== undefined) {
              CookieHeader = res.headers['set-cookie'][0] + ';' + res.headers['set-cookie'][1];
              _resolve(CookieHeader);
            }
          });
        });

        const authCodeResponse = await got(ALL_ENDPOINTS.EU.login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': CookieHeader
          },
          json: true,
          body: {
            email: this.config.username,
            password: this.config.password
          }
        });

        const authCode = authCodeResponse.body.redirectUrl.split('?')[1].split('&')[0].split('=')[1];
        // logger.debug('Got auth code: ' + authCode);

        const formData = new URLSearchParams();
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', ALL_ENDPOINTS.EU.redirect_uri);
        formData.append('code', authCode);

        const response = await got(ALL_ENDPOINTS.EU.token, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic NmQ0NzdjMzgtM2NhNC00Y2YzLTk1NTctMmExOTI5YTk0NjU0OktVeTQ5WHhQekxwTHVvSzB4aEJDNzdXNlZYaG10UVI5aVFobUlGampvWTRJcHhzVg==',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length':'154',
            'Host': 'prd.eu-ccapi.hyundai.com:8080',
            'Connection':'Keep-Alive',
            'Accept-Encoding':'gzip',
            'User-Agent': 'okhttp/3.10.0',
            'grant_type': 'authorization_code'
          },
          body: formData.toString(),
        });

        this.session.accessToken = 'Bearer ' + JSON.parse(response.body).access_token;
        resolve('Login success');
        // logger.debug(JSON.stringify(response.body));
      } catch (err) {
        this.logger.debug(JSON.stringify(err.message));
        reject(err.message);
      }
    });
  }

  logout(): Promise<string> {
    return Promise.resolve('OK');
  }

  async getVehicles(): Promise<Array<Vehicle>> {
    return new Promise(async (resolve, reject) => {
        if(this.session.accessToken !== undefined) {
          const response = await got('https://prd.eu-ccapi.hyundai.com:8080/api/v1/spa/vehicles', {
            method: 'GET',
            headers: {
              'Authorization': this.session.accessToken,
              'ccsp-device-id': this.session.deviceId
            },
            json: true
          });

          response.body.resMsg.vehicles.forEach(v => {
            this.vehicles.push(new EuropeanVehicle(v.master, v.nickname, v.regDate, v.type, v.vehicleId, v.vehicleName, this.session));
          });
          resolve(this.vehicles);
        } else {
            reject('Token not set');
        }
    })
  }
}
