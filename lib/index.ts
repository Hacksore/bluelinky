import * as got from 'got';
import * as FormData from 'form-data';
import { EventEmitter } from 'events';

const endpoints = {
  getToken: 'https://owners.hyundaiusa.com/etc/designs/ownercommon/us/token.json?reg=',
  validateToken: 'https://owners.hyundaiusa.com/libs/granite/csrf/token.json',
  auth: 'https://owners.hyundaiusa.com/bin/common/connectCar',
  remoteAction: 'https://owners.hyundaiusa.com/bin/common/remoteAction',
  usageStats: 'https://owners.hyundaiusa.com/bin/common/usagestats',
  health: 'https://owners.hyundaiusa.com/bin/common/VehicleHealthServlet',
  messageCenter: 'https://owners.hyundaiusa.com/bin/common/MessageCenterServlet',
  myAccount: 'https://owners.hyundaiusa.com/bin/common/MyAccountServlet',
  status: 'https://owners.hyundaiusa.com/bin/common/enrollmentFeature',
  enrollmentStatus: 'https://owners.hyundaiusa.com/bin/common/enrollmentStatus',
  subscriptions: 'https://owners.hyundaiusa.com/bin/common/managesubscription'
};

interface AuthConfig {
  username: string|null;
  password: string|null;
}

interface StartConfig {
  airCtrl?: boolean|string;
  igniOnDuration: number;
  airTempvalue?: number;
  defrost?: boolean|string;
  heating1?: boolean|string;
}

interface HyundaiResponse {
  status: string;
  result: any;
  errorMessage: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  username: string;
}

function buildFormData(config) {
  const form = new FormData();
  for (const key in config) {
    const value = config[key];
    if(typeof value !== 'object') {
      form.append(key, value.toString());
    }
  }
  return form;
}

interface VehicleConfig {
  vin: string|null;
  pin: string|null;
  token: string|null;
  bluelinky: BlueLinky;
}

class Vehicle {
  private _vin: string|null;
  private _pin: string|null;
  private _eventEmitter: EventEmitter;
  private _bluelinky: BlueLinky;

  private _currentFeatures = {};

  constructor(config: VehicleConfig) {
    this._vin = config.vin;
    this._pin = config.pin;
    this._eventEmitter = new EventEmitter();
    this._bluelinky = config.bluelinky;

    this.onInit();
  }

  addFeature(featureName, state) {
    this._currentFeatures[featureName] = (state === 'ON' ? true : false);
  }

  async onInit() {
    const response = await this.features();

    if(response!.result === 'E:Failure' ||  response!.result !== undefined) {

      response!.result.forEach(item => {
        this.addFeature(item.featureName, item.featureStatus);
      });

    }
    // we tell the vehicle it's loaded :D
    this._eventEmitter.emit('ready');
  }

  get vin(): string|null {
    return this._vin;
  }

  get eventEmitter(): EventEmitter {
    return this._eventEmitter;
  }

  hasFeature(featureName: string): boolean {
    return this._currentFeatures[featureName];
  }

  getFeatures(): object {
    return this._currentFeatures;
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

    const response = await this._request(endpoints.remoteAction, {
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

    const response = await this._request(endpoints.remoteAction, {
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

    const response = await this._request(endpoints.remoteAction, {
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

    const response = await this._request(endpoints.remoteAction, {
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

  async status(refresh: boolean = false): Promise<HyundaiResponse|null> {

    const response = await this._request(endpoints.status,  {
      services: 'getVehicleStatus', // THIS IS WHAT HAPPENS WHEN YOU MAKE A PRO TYPO.... services (plural)
      gen: 2,
      regId: this.vin,
      refresh: refresh // I think this forces the their API to connect to the vehicle and pull the status
    });

    return {
      result: response.RESPONSE_STRING.vehicleStatus,
      status: response.E_IFRESULT,
      errorMessage: response.E_IFFAILMSG
    };

  }

  async _request(endpoint, data): Promise<any|null> {

    // handle token refresh if we need to
    await this._bluelinky.handleTokenRefresh();

    const merged = Object.assign({
      vin: this.vin,
      username: this._bluelinky.username,
      pin: this._pin,
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      token: this._bluelinky.accessToken
    }, data);

    const formData = buildFormData(merged);

    const response = await got(endpoint, {
      method: 'POST',
      body: formData,
    });

    try {

      return JSON.parse(response.body);

    } catch (e) {
      return null;
    }
  }
}

class BlueLinky {

  private authConfig: AuthConfig = {
    username: null,
    password: null
  };

  private _accessToken: string|null = null;
  private _tokenExpires: number|null = null;
  private _vehicles: Array<Vehicle> = [];

  constructor(authConfig: AuthConfig) {
    this.authConfig = authConfig;
  }

  async login(): Promise<void> {
    const response = await this.getToken();
    const expires = Math.floor((+new Date()/1000) + parseInt(response.expires_in, 10));

    this.accessToken = response.access_token;
    this.tokenExpires = expires;
  }

  get accessToken(): string|null {
    return this._accessToken;
  }

  set accessToken(token: string|null) {
    this._accessToken = token;
  }

  set tokenExpires(unixtime: number) {
    this._tokenExpires = unixtime;
  }

  get tokenExpires(): number {
    return this._tokenExpires || 0;
  }

  get username(): string|null {
    return this.authConfig.username;
  }

  getVehicles() {
    return this._vehicles;
  }

  getVehicle(vin: string): Vehicle|undefined {
    return this._vehicles.find(item => vin === item.vin);
  }

  registerVehicle(vin: string, pin: string): Promise<Vehicle|null> {

    if(!this.getVehicle(vin)) {
      const vehicle = new Vehicle({
        vin: vin,
        pin: pin,
        token: this.accessToken,
        bluelinky: this
      });

      this._vehicles.push(vehicle);

      return new Promise((resolve, reject) => {
        vehicle.eventEmitter.on('ready', () => resolve(vehicle));
      });
    }

    return Promise.resolve(null);
  }

  // I think this would be good enough as teh vehcile class will check when the token expires before doing a request
  // if it is at or over the time it should tell it's dad to get a new token
  async handleTokenRefresh() {
    const currentTime = Math.floor((+new Date()/1000));

    // refresh 60 seconds before timeout
    if(currentTime >= (this.tokenExpires - 60)) {
      console.log('token is expired, refreshing access token');
      await this.getToken();
    }
  }

  async getToken(): Promise<TokenResponse> {
    let response: got.Response<any|null>;

    const now = Math.floor(+new Date() / 1000);
    response = await got(endpoints.getToken + now, {
      method: 'GET',
      json: true
    });

    const csrfToken = response.body.token;

    response = await got(endpoints.validateToken, {
      method: 'GET',
      headers: {
        Cookie: `csrf_token=${csrfToken};`
      }
    });

    const formData = buildFormData({
      ':cq_csrf_token': csrfToken,
      'username': this.authConfig.username,
      'password': this.authConfig.password,
      'url': 'https://owners.hyundaiusa.com/us/en/index.html'
    });

    response = await got(endpoints.auth, {
      method: 'POST',
      body: formData
    });

    const json = JSON.parse(response.body);
    return json.Token;

  }
}

export = BlueLinky;
