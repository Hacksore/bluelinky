import got from 'got';
import logger from '../logger';

import { REGIONS } from '../constants';
import { CA_ENDPOINTS, CLIENT_ORIGIN } from '../constants/canada';

import { 
  StartConfig,
  VehicleCommandResponse,
  VehicleFeatures,
  VehicleFeaturesModel,
  VehicleInfo,
  VehicleInfoResponse,
  VehicleLocation, 
  VehicleNextService, 
  VehicleStatus,
  Odometer 
} from '../interfaces/common.interfaces';

import { Vehicle } from './vehicle';

export default class CanadianVehicle extends Vehicle {

  private _nextService: VehicleNextService | null = null;
  private _location: VehicleLocation | null = null;

  private _info: VehicleInfo | null = null;
  private _features: VehicleFeatures | null = null;
  private _featuresModel: VehicleFeaturesModel | null = null;
  private _status: VehicleStatus | null = null;

  public region = REGIONS.CA;

  private timeOffset = -(new Date().getTimezoneOffset() / 60)

  constructor(public config, public controller) {
    super(controller);
    logger.info(`CA Vehicle ${this.config.vehicleId} created`);
  }

  get name(): string {
    return this.config.nickname;
  }

  get vin(): string {
    return this.config.vin;
  }

  get vehicleId(): string {
    return this.config.vehicleId;
  }

  get gen(): string {
    throw new Error('Method not implemented.');
  }

  get type(): string {
    return this.type;
  }

  get location(): VehicleLocation | null {
    return this._location
  }

  get odometer(): Odometer | null {
    throw new Error('Method not implemented.');
  }

  //////////////////////////////////////////////////////////////////////////////
  // Vehicle
  //////////////////////////////////////////////////////////////////////////////
  // TODO: type this
  public async vehicleInfo(): Promise<VehicleInfoResponse> {
    logger.info('Begin vehicleInfo request');
    try {
      const response = await this.request(CA_ENDPOINTS.vehicleInfo, {});
      const vehicleInfoResponse = response.result as VehicleInfoResponse;
      this._info = vehicleInfoResponse.vehicleInfo;
      this._status = vehicleInfoResponse.status;
      this._features = vehicleInfoResponse.features;
      this._featuresModel = vehicleInfoResponse.featuresModel;
      return Promise.resolve(vehicleInfoResponse);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  public async status(refresh = false): Promise<VehicleStatus> {
    logger.info('Begin status request, polling car: ' + refresh);
    try {
      const endpoint = refresh ? CA_ENDPOINTS.remoteStatus : CA_ENDPOINTS.status;
      const response = await this.request(endpoint, {});
      this._status = response.result as VehicleStatus;
      return Promise.resolve(this._status);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  public async nextService(): Promise<VehicleNextService> {
    logger.info('Begin nextService request');
    try {
      const response = await this.request(CA_ENDPOINTS.nextService, {});
      this._nextService = response.result as VehicleNextService
      return Promise.resolve(this._nextService);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Car commands with preauth (PIN)
  //////////////////////////////////////////////////////////////////////////////

  public async lock(): Promise<string> {
    logger.info('Begin lock request');
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(
        CA_ENDPOINTS.lock,
        {},
        { pAuth: preAuth });
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  public async unlock(): Promise<string> {
    logger.info('Begin unlock request');
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(
        CA_ENDPOINTS.unlock,
        {},
        { pAuth: preAuth });
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  /*
  airCtrl: Boolean,  // climatisation
  heating1: Boolean, // front defrost, airCtrl will be on
  defrost: Boolean,  // side mirrors & rear defrost
  airTempvalue: number | null  // temp in degrees for clim and heating 17-27
  */
  public async start(startConfig: StartConfig): Promise<string> {
    logger.info('Begin startClimate request');
    try {
      const body =
      {
        hvacInfo: {
          airCtrl: ((startConfig.airCtrl ?? false) || (startConfig.defrost ?? false)) ? 1 : 0,
          defrost: startConfig.defrost ?? false,
          // postRemoteFatcStart: 1,
          heating1: startConfig.heating1 ? 1 : 0
        }
      }

      const airTemp = startConfig.airTempvalue
      if (airTemp != null) {
        if (airTemp > 27 || airTemp < 17) {
          return Promise.reject("air temperature should be between 17 and 27 degrees");
        }
        let airTempValue: string = (6 + (airTemp - 17) * 2).toString(16).toUpperCase() + 'H';
        if (airTempValue.length == 2) {
          airTempValue = '0' + airTempValue
        }
        body.hvacInfo['airTemp'] = { value: airTempValue, unit: 0, hvacTempType: 1 }
      } else if ((startConfig.airCtrl ?? false) || (startConfig.defrost ?? false)) {
        return Promise.reject("air temperature should be specified")
      }

      const preAuth = await this.getPreAuth();
      const response = await this.request(
        CA_ENDPOINTS.start,
        body,
        { pAuth: preAuth });

      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  public async stop(): Promise<string> {
    logger.info('Begin stop request');
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(CA_ENDPOINTS.stop, {
        pAuth: preAuth
      });
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  // TODO: type this
  public async  lights(withHorn = false): Promise<any> {
    logger.info('Begin lights request with horn ' + withHorn);
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(
        CA_ENDPOINTS.hornlight,
        { horn: withHorn },
        { pAuth: preAuth }
      );
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  public async locate(): Promise<VehicleLocation> {
    logger.info('Begin locate request');
    try {
      const preAuth = await this.getPreAuth();
      const response = await this.request(
        CA_ENDPOINTS.locate,
        {},
        { pAuth: preAuth }
      );
      this._location = response.result as VehicleLocation
      return Promise.resolve(this._location);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Internal
  //////////////////////////////////////////////////////////////////////////////
  // TODO: type this
  private async getPreAuth(): Promise<String> {
    logger.info('Begin pre-authentication');
    try {
      const response = await this.request(CA_ENDPOINTS.verifyPin, {});
      return Promise.resolve(response.result.pAuth);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }

  private async request(endpoint, body: object, headers: object = {}, ): Promise<any | null> {
    logger.info(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);

    try {
      const response = await got(endpoint, {
        method: 'POST',
        json: true,
        headers: {
          from: CLIENT_ORIGIN,
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

      if (response.body.responseHeader.responseCode != 0) {
        return Promise.reject('bad request: ' + response.body.responseHeader.responseDesc)
      }

      return Promise.resolve(response.body);
    } catch (err) {
      return Promise.reject('error: ' + err)
    }
  }
}
