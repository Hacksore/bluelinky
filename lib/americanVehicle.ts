import BlueLinky from './index';
import EventEmitter from 'events';
import allEndpoints from './endpoints';
import got from 'got';
import { buildFormData } from './util';

import {
  StartConfig,
  HyundaiResponse,
  VehicleConfig,
  VehicleStatus,
  AmericanEndpoints
} from './interfaces';

import logger from './logger';
import BaseVehicle from './baseVehicle';

export default class AmericanVehicle extends BaseVehicle {
  private endpoints: AmericanEndpoints = allEndpoints['US'];

  constructor(config: VehicleConfig) {
    super(config);
    this.vin = config.vin;
    this.pin = config.pin;
    this.bluelinky = config.bluelinky;
    this.currentFeatures = {};

    this.onInit();
  }

  handleTokenRefresh() {

  }

  async onInit() {
    logger.info('calling onInit()')
    const response = await this.features();
    logger.info(`Getting features ${response}`);

    if(response!.result === 'E:Failure' ||  response!.result !== undefined) {

      response!.result.forEach(item => {
        this.addFeature(item.featureName, item.featureStatus);
      });

    }
    // we tell the vehicle it's loaded :D
    this.emit('ready');
  }

  async unlock(): Promise<HyundaiResponse|null> {

    if(!this.hasFeature('DOOR UNLOCK')) {
      throw new Error('Vehicle does not have the unlock feature');
    }

    const formData = {
      gen: 2,
      regId: this.vin,
      service: 'remoteunlock'
    };

    const response = await this._request(this.endpoints.remoteAction, formData);

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async lock(): Promise<HyundaiResponse|null> {

    if(!this.hasFeature('DOOR LOCK')) {
      throw new Error('Vehicle does not have the lock feature');
    }

    const response = await this._request(this.endpoints.remoteAction, {
      gen: 2,
      regId: this.vin,
      service: 'remotelock'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async start(config: StartConfig): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.remoteAction, {
      gen: 2,
      regId: this.vin,
      service: 'ignitionstart',
      ...config
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async stop(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.remoteAction, {
      gen: 2,
      regId: this.vin,
      service: 'ignitionstop'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };

  }

  async flashLights(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.remoteAction, {
      gen: 2,
      regId: this.vin,
      service: 'light'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async panic(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.remoteAction, {
      gen: 2,
      regId: this.vin,
      service: 'horn'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async health(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.health, {
      service: 'getRecMaintenanceTimeline'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };

  }

  async apiUsageStatus(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.usageStats,  {
      startdate: 20140401, // TODO: make these paramters
      enddate: 20190611, // TODO: make these paramters
      service: 'getUsageStats'
    });

    return {
      result: response.RESPONSE_STRING.OUT_DATA,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async messages(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.messageCenter, {
      service: 'messagecenterservices'
    });

    return {
      result: response.RESPONSE_STRING.results,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async accountInfo(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.myAccount,  {
      service: 'getOwnerInfoDashboard'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async features(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.enrollmentStatus,  {
      service: 'getEnrollment'
    });

    return {
      result: response.FEATURE_DETAILS.featureDetails,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async serviceInfo(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.myAccount, {
      service: 'getOwnersVehiclesInfoService'
    });

    return {
      result: response.OwnerInfo,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async pinStatus(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.myAccount, {
      service: 'getpinstatus'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };

  }

  async subscriptionStatus(): Promise<HyundaiResponse|null> {

    const response = await this._request(this.endpoints.subscriptions, {
      service: 'getproductCatalogDetails'
    });

    return {
      result: response.RESPONSE_STRING.OUT_DATA.PRODUCTCATALOG,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async status(refresh: boolean = false): Promise<VehicleStatus|null> {

    const response = await this._request(this.endpoints.status,  {
      services: 'getVehicleStatus', // THIS IS WHAT HAPPENS WHEN YOU MAKE A PRO TYPO.... services (plural)
      gen: 2,
      regId: this.vin,
      refresh: refresh // I think this forces the their API to connect to the vehicle and pull the status
    });

    return response.RESPONSE_STRING.vehicleStatus;

  }

  private async _request(endpoint, data): Promise<any|null> {
    logger.info(`[${endpoint}] ${JSON.stringify(data)}`);
    logger.info(`[AUTH] ${this.auth.accessToken}`);

    // handle token refresh if we need to
    await this.handleTokenRefresh();

    const merged = {
      vin: this.vin,
      username: this.auth.username,
      pin: this.pin,
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      token: this.auth.accessToken,
      ...data
    };

    const formData = buildFormData(merged);

    const response = await got(endpoint, {
      method: 'POST',
      body: formData,
    });

    logger.debug(JSON.stringify(response.body));

    if (response.body.includes('PIN Locked')) {
      throw new Error('PIN is locked, please correct the isssue before trying again.');
    }

    try {
      return JSON.parse(response.body);
    } catch (e) {
      return response.body;
    }
  }
}
