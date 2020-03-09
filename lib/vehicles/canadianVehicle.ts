import got from 'got';
import { REGIONS } from '../constants';
import { VehicleStatus, VehicleLocation, Odometer } from '../interfaces/common.interfaces';
import { ALL_ENDPOINTS, CA_BASE_URL, CA_ENDPOINTS } from '../constants';

import logger from '../logger';
import { Vehicle } from './vehicle';
import { StartConfig } from '../interfaces/american.interfaces';

export default class CanadianVehicle extends Vehicle {
  private _status: VehicleStatus | null = null;
  public region = REGIONS.CA;

  private timeOffset = -(new Date().getTimezoneOffset() / 60) 

  constructor(public config, public controller) {
    super(controller);
    logger.info(`CA Vehicle ${this.config.vehicleId} created`);
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

  get vehicleId(): string {
    return this.config.vehicleId;
  }
  
  // updateStatus(): Promise<VehicleStatus> {
  //   throw new Error('Method not implemented.');
  // }

  get name(): string {
    return this.config.nickname;
  }

  get type(): string {
    return this.type;
  }


  //////////////////////////////////////////////////////////////////////////////
  // Vehicle
  //////////////////////////////////////////////////////////////////////////////

  async vehicleInfo(): Promise<any> {
    logger.info('Begin vehicleInfo request');
    const response = await this.request(this.endpoints.vehicleInfo, {});
    return response.body.result;
  }

  public async status(refresh = false): Promise<VehicleStatus> {
    const endpoint = refresh ? ALL_ENDPOINTS.CA.remoteStatus : ALL_ENDPOINTS.CA.status;
    const response = await this.request(endpoint, {});
    this._status = response.result as VehicleStatus;
    return Promise.resolve(this._status);
  }


  //////////////////////////////////////////////////////////////////////////////
  // Car commands with preauth (PIN)
  //////////////////////////////////////////////////////////////////////////////

  public async lock(): Promise<string> {
    logger.info('Begin lock request');
    // get pAuth header
    const preAuth = await this.getPreAuth();
    // do lock request
    const response = await this.request(CA_ENDPOINTS.lock, {
      pAuth: preAuth
    });
    return response.body;
  }

  public async unlock(): Promise<string> {
    logger.info('Begin unlock request');
    const preAuth = await this.getPreAuth();
    const response = await this.request(CA_ENDPOINTS.unlock, {
      pAuth: preAuth
    });
    return response.body;
  }

  /*
  airCtrl: Boolean,  // climatisation
  heating1: Boolean, // front defrost, airCtrl will be on
  defrost: Boolean,  // side mirrors & rear defrost
  airTempvalue: number | null  // temp in degrees for clim and heating 17-27
  */
 public async startClimate(startConfig: StartConfig): Promise<string> {
  const body =  
  { hvacInfo: {
    airCtrl: ((startConfig.airCtrl ?? false) || (startConfig.defrost ?? false)) ? 1 : 0,
    defrost: startConfig.defrost ?? false,
    // postRemoteFatcStart: 1,
    heating1: startConfig.heating1 ? 1 : 0
  }}

  let airTemp = startConfig.airTempvalue
  if (airTemp != null) {
    if (airTemp > 27 || airTemp < 17) {
      return Promise.reject("air temperature should be between 17 and 27 degrees");
    }
    var airTempValue: String = (6 + (airTemp - 17) * 2).toString(16).toUpperCase() + 'H';
    if (airTempValue.length == 2) {
      airTempValue = '0' + airTempValue
    }
    body.hvacInfo['airTemp'] = {value: airTempValue,unit:0,hvacTempType:1}
  } else if ((startConfig.airCtrl ?? false) || (startConfig.defrost ?? false)) {
    return Promise.reject("air temperature should be specified")
  }

  logger.info('Begin start request ' + JSON.stringify(body));
  const preAuth = await this.getPreAuth();
  const response = await this.request(CA_ENDPOINTS.start, {
    pAuth: preAuth
  }, body);

  return response.body;
 }

 public async stopClimate(): Promise<string> {
    logger.info('Begin stop request');
    const preAuth = await this.getPreAuth();
    const response = await this.request(CA_ENDPOINTS.stop, {
      pAuth: preAuth
    });
    return response.body;
  }

  public async location(): Promise<VehicleLocation> {
    logger.info('Begin location request');
    const preAuth = await this.getPreAuth();
    const response = await this.request(CA_ENDPOINTS.location, {
      pAuth: preAuth
    });
    return response.body;
  }

  public async  lights(withHorn = false): Promise<any> {
    logger.info('Begin location request');
    const preAuth = await this.getPreAuth();
    const response = await this.request(
      CA_ENDPOINTS.hornlight, 
      { pAuth: preAuth},
      { horn: withHorn });
    return response.body;
  }


  //////////////////////////////////////////////////////////////////////////////
  // Internal
  //////////////////////////////////////////////////////////////////////////////

  private async getPreAuth() {
    const response = await this.request(CA_ENDPOINTS.verifyPin, {});
    const pAuth = response.body.result.pAuth;
    logger.info('pAuth ' + pAuth);
    return pAuth;
  }

  private async request(endpoint, body: object, headers: object = {}, ): Promise<any | null> {
    logger.info(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);

    try {
      const response = await got(endpoint, {
        method: 'POST',
        json: true,
        headers: {
          from: 'SPA',
          language: 1,
          offset: this.timeOffset,
          accessToken: this.controller.session.accessToken,
          vehicleId: this.config.vehicleId,
          ...headers
        },
        body: {
          pin: this.config.pin,
          ...body
        }
      });


      if (response.body.responseHeader.responseCode != 0)
      {
        return Promise.reject('bad request: ' + response.body.responseHeader.responseDesc)
      }

      // console.log( '********* response ' + JSON.stringify(response))
      return Promise.resolve(response.body);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }
}
