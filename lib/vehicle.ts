import BlueLinky from './index';
import EventEmitter from 'events';
import { endpoints, SERVICE, GEN_ONE, GEN_TWO} from './endpoints';
import got from 'got';
import { buildFormData } from './util';

import {
  StartConfig,
  HyundaiResponse,
  VehicleConfig,
  VehicleStatus
} from './interfaces';

import logger from './logger';

export default class Vehicle extends EventEmitter {
  private vin: string|null;
  private pin: string|null;
  private bluelinky: BlueLinky;
  private currentFeatures: object;
  private gen: number = 2;
  private regId: string|null = null;

  constructor(config: VehicleConfig) {
    super(); 
    this.vin = config.vin;
    this.pin = config.pin;
    this.bluelinky = config.bluelinky;
    this.currentFeatures = {};

    this.onInit();
  }

  addFeature(featureName, state) {
    this.currentFeatures[featureName] = (state === 'ON' ? true : false);
  }

  async onInit() {
    const response = await this.features();

    if(response!.result === 'E:Failure' ||  response!.result !== undefined) {

      response!.result.forEach(item => {
        this.addFeature(item.featureName, item.featureStatus);
      });

    }
    
    // get back the info that has gen
    const vehicleInfo = await this.accountInfo();

    if (vehicleInfo !== null) {
      const info = vehicleInfo.result[0].veh;
      this.gen = info.IsGen2;
      this.regId = info.RegistrationID;
      logger.debug(`registering a gen ${this.gen} vehicle`);
    }
    // we tell the vehicle it's loaded :D
    this.emit('ready');
  }

  getVinNumber(): string|null {
    return this.vin;
  }

  hasFeature(featureName: string): boolean {
    return this.currentFeatures[featureName];
  }

  getFeatures(): object {
    return this.currentFeatures;
  }

  async unlock(): Promise<HyundaiResponse|null> {

    if(!this.hasFeature('DOOR UNLOCK')) {
      throw new Error('Vehicle does not have the unlock feature');
    }

    const formData = {
      service: 'remoteunlock'
    };

    const response = await this._request(endpoints.remoteAction, formData);

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

    const response = await this._request(endpoints.remoteAction, {
      service: 'remotelock'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async start(config: StartConfig): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.remoteAction, {
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

    const response = await this._request(endpoints.remoteAction, {
      service: 'ignitionstop'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };

  }

  async flashLights(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.remoteAction, {
      service: 'light'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async panic(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.remoteAction, {
      service: 'horn'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async health(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.health, {
      service: 'getRecMaintenanceTimeline'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };

  }

  async apiUsageStatus(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.usageStats,  {
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

    const response = await this._request(endpoints.messageCenter, {
      service: 'messagecenterservices'
    });

    return {
      result: response.RESPONSE_STRING.results,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async accountInfo(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.myAccount,  {
      service: 'getOwnerInfoDashboard'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async features(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.enrollmentStatus,  {
      service: 'getEnrollment'
    });

    return {
      result: response.FEATURE_DETAILS.featureDetails,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async serviceInfo(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.myAccount, {
      service: 'getOwnersVehiclesInfoService'
    });

    return {
      result: response.OwnerInfo,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async pinStatus(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.myAccount, {
      service: 'getpinstatus'
    });

    return {
      result: response.RESPONSE_STRING,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };

  }

  async subscriptionStatus(): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.subscriptions, {
      service: 'getproductCatalogDetails'
    });

    return {
      result: response.RESPONSE_STRING.OUT_DATA.PRODUCTCATALOG,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };
  }

  async status(refresh: boolean = false): Promise<VehicleStatus|null> {

    if (this.gen === GEN_ONE) {
      throw new Error('Status feature is not supported on gen 1 vehicles :(');
    }

    // kind of think this is not necassary anymore?
    const service = SERVICE.status[this.gen];
    const response = await this._request(endpoints.status,  {
      // what is the key called for you here? services or service?
      services: service, // THIS IS WHAT HAPPENS WHEN YOU MAKE A PRO TYPO.... services (plural)
      refresh: refresh // I think this forces the their API to connect to the vehicle and pull the status
    });

    return response.RESPONSE_STRING.vehicleStatus;

  }

  private async _request(endpoint, data): Promise<any|null> {
    logger.debug(`[${endpoint}] ${JSON.stringify(data)}`);

    // handle token refresh if we need to
    await this.bluelinky.handleTokenRefresh();

    const formData = buildFormData({
      vin: this.vin,
      username: this.bluelinky.username,
      pin: this.pin,
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      token: this.bluelinky.getAccessToken(),
      gen: this.gen,
      regId: this.regId,
      ...data
    });

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
