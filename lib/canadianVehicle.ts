import { CA_ENDPOINTS } from './constants';
import got from 'got';

import BaseVehicle from './baseVehicle';

import {
  StartConfig,
  VehicleConfig,
  VehicleStatus,
  CanadianEndpoints
} from './interfaces';

import logger from './logger';

export default class CanadianVehicle extends BaseVehicle {
  private endpoints: CanadianEndpoints = CA_ENDPOINTS;

  private vehicleId: string = '';

  constructor(config: VehicleConfig) {
    super(config);
    this.vin = config.vin;
    this.pin = config.pin;
    this.bluelinky = config.bluelinky;
    this.auth.accessToken = config.token;

    this.onInit();
  }

  async onInit() {
    logger.info('onInit from CA');

    // get list of vehicles and find the vehicle id
    const vehicles = await this.getVehicleList();
    const foundVehicle = vehicles.find(car => car.vin === this.vin);

    console.log('Found vehicle:', foundVehicle.vehicleId);
    this.vehicleId = foundVehicle.vehicleId;

    this.emit('ready');
  }


  //////////////////////////////////////////////////////////////////////////////
  // Account
  //////////////////////////////////////////////////////////////////////////////

  async myAccount(): Promise<any> {
    logger.info('Begin myAccount request');
    const response = await this._request(this.endpoints.myAccount, {});
    return response.body.result;
  }

  async nextService(): Promise<any> {
    logger.info('Begin nextService request');
    const response = await this._request(this.endpoints.nextService, {});
    return response.body;
  }

  async preferedDealer(): Promise<any> {
    logger.info('Begin preferedDealer request');
    const response = await this._request(this.endpoints.preferedDealer, {});
    return response.body;
  }


  //////////////////////////////////////////////////////////////////////////////
  // Vehicle
  //////////////////////////////////////////////////////////////////////////////

  async getVehicleList(): Promise<any> { // TODO: type this
    console.log('getVehicleList');
    const token = this.bluelinky.getAccessToken() || '';
    const response = await this._request(this.endpoints.vehicleList, {});
    console.log(JSON.stringify(response.body, null, 2));
    return response.body.result.vehicles;
  }

  async vehicleInfo(): Promise<any> {
    logger.info('Begin vehicleInfo request');
    const response = await this._request(this.endpoints.vehicleInfo, {});
    return response.body.result;
  }

  async status(refresh = false): Promise<VehicleStatus|null> {
    logger.info('Begin status request');
    const endpoint = refresh ? this.endpoints.remoteStatus : this.endpoints.status;
    const response = await this._request(endpoint, {});
    return response.body;
  }
  

  //////////////////////////////////////////////////////////////////////////////
  // Car commands with preauth (PIN)
  //////////////////////////////////////////////////////////////////////////////

  async lock(): Promise<any> {
    logger.info('Begin lock request');
    // get pAuth header
    const preAuth = await this.getPreAuth();
    // do lock request
    const response = await this._request(this.endpoints.lock, {
      pAuth: preAuth
    });
    return response.body;
  }

  async unlock(): Promise<any> {
    logger.info('Begin unlock request');
    const preAuth = await this.getPreAuth();
    const response = await this._request(this.endpoints.unlock, {
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
  async start(config: StartConfig): Promise<any> {
    const body =  
    { hvacInfo: {
      airCtrl: ((config.airCtrl ?? false) || (config.defrost ?? false)) ? 1 : 0,
      defrost: config.defrost ?? false,
      // postRemoteFatcStart: 1,
      heating1: config.heating1 ? 1 : 0
    }}

    let airTemp = config.airTempvalue
    if (airTemp != null) {
      if (airTemp > 27 || airTemp < 17) {
        return "air temperature should be between 17 and 27 degrees";
      }
      var airTempValue: String = (6 + (airTemp - 17) * 2).toString(16).toUpperCase() + 'H';
      if (airTempValue.length == 2) {
        airTempValue = '0' + airTempValue
      }
      body.hvacInfo['airTemp'] = {value: airTempValue,unit:0,hvacTempType:1}
    } else if ((config.airCtrl ?? false) || (config.defrost ?? false)) {
      return "air temperature should be specified"
    }

    logger.info('Begin start request ' + JSON.stringify(body));
    const preAuth = await this.getPreAuth();
    const response = await this._request(this.endpoints.start, {
      pAuth: preAuth
    }, body);

    return response.body;
  }

  async stop(): Promise<any> {
    logger.info('Begin stop request');
    const preAuth = await this.getPreAuth();
    const response = await this._request(this.endpoints.stop, {
      pAuth: preAuth
    });
    return response.body;
  }

  async locate(): Promise<any> {
    logger.info('Begin locate request');
    const preAuth = await this.getPreAuth();
    const response = await this._request(this.endpoints.locate, {
      pAuth: preAuth
    });
    return response.body;
  }

  async lights(withHorn = false): Promise<any> {
    logger.info('Begin locate request');
    const preAuth = await this.getPreAuth();
    const response = await this._request(
      this.endpoints.hornlight, 
      { pAuth: preAuth},
      { horn: withHorn });
    return response.body;
  }


  //////////////////////////////////////////////////////////////////////////////
  // Internal
  //////////////////////////////////////////////////////////////////////////////

  private async getPreAuth() {
    const response = await this._request(this.endpoints.verifyPin, {});
    const pAuth = response.body.result.pAuth;
    logger.info('pAuth ' + pAuth);
    return pAuth;
  }

  private async _request(endpoint, headers, body: object | null = null): Promise<any|null> {
    logger.info(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);

    const response = await got(endpoint, {
      method: 'POST',
      json: true,
      headers: {
        from: 'SPA',
        language: '1',
        Host: 'mybluelink.ca',
        Origin: 'https://mybluelink.ca',
        offset: '-5',
        pin: this.pin,
        accessToken: this.bluelinky.getAccessToken(),
        vehicleId: this.vehicleId,
        ...headers
      },
      body: {
        pin: this.pin,
        ...body
      }
    });

    return response;
  }
}
