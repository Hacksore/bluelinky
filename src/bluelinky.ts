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
  airCtrl: boolean|string;
  igniOnDuration: number;
  airTempvalue: number;
  defrost: boolean|string;
  heating1: boolean|string;
}

interface HyundaiResponse {
  status: string;
  result: any;
  errorMessage?: string|null;
  ENROLLMENT_DETAILS?: any;
  FEATURE_DETAILS?: any;
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
    const value = config[key].toString();
    form.append(key, value);
  }
  return form;
}

interface VehicleConfig {
  vin: string|null;
  pin: string|null;
  username: string|null;
  token: string|null;
  bluelinky: BlueLinky;
}

class Vehicle {
  public vin: string|null;
  public pin: string|null;
  public username: string|null;
  public token: string|null;
  public eventEmitter: EventEmitter;
  public bluelinky: BlueLinky;

  public currentFeatures = {};

  constructor(config: VehicleConfig) {
    this.vin = config.vin;
    this.pin = config.pin;
    this.username = config.username;
    this.token = config.token;
    this.eventEmitter = new EventEmitter();
    this.bluelinky = config.bluelinky;

    this.onInit();
  }

  async onInit() {
    console.log(this.vin + ' is loading...');
    const response = await this.enrollmentStatus();
    console.log(response)

    if(response!.result === 'E:Failure' ||  response!.result.featureDetails !== undefined) {

      response!.result.featureDetails.forEach(item => {
        this.currentFeatures[item.featureName] = (item.featureStatus === 'ON' ? true : false);
      });

    }
    // we tell the vehicle it's loaded :D
    this.eventEmitter.emit('ready');
  }

  hasFeature(featureName: string): boolean {
    return this.currentFeatures[featureName];
  }

  unlock(): Promise<HyundaiResponse|null> {
    if(!this.hasFeature('DOOR UNLOCK')) {
      throw new Error('Vehicle does not have the unlock feature');
    }

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.vin,
      service: 'remoteunlock'
    };

    return this._request(endpoints.remoteAction, formData);
  }

  lock(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: 'H00002548087V' + this.vin,
      service: 'remotelock'
    };

    return this._request(endpoints.remoteAction, formData);
  }

  startVehicle(config: StartConfig): Promise<HyundaiResponse|null> {

    const formData = Object.assign({
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.vin,
      service: 'ignitionstart'
    }, config);

    return this._request(endpoints.remoteAction, formData);
  }

  stopVehicle(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.vin,
      service: 'ignitionstop'
    };

    return this._request(endpoints.remoteAction, formData);
  }

  flashLights(): Promise<HyundaiResponse|null> {

    const formData = buildFormData({
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.vin,
      service: 'light'
    });

    return this._request(endpoints.remoteAction, formData);
  }

  panic(): Promise<HyundaiResponse|null> {

    const formData = buildFormData({
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.vin,
      service: 'horn'
    });

    return this._request(endpoints.remoteAction, formData);
  }

  health(): Promise<HyundaiResponse|null> {

    const formData = {
      vin: this.vin,
      url: 'https://owners.hyundaiusa.com/us/en/page/vehicle-health.html',
      service: 'getRecMaintenanceTimeline'
    };

    return this._request(endpoints.health, formData);
  }

  apiUsageStatus(): Promise<HyundaiResponse|null> {

    const formData = {
      startdate: 20140401, // TODO: make these paramters 
      enddate: 20190611, // TODO: make these paramters 
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'getUsageStats'
    };

    return this._request(endpoints.usageStats, formData);
  }

  messages(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'messagecenterservices'
    };

    return this._request(endpoints.messageCenter, formData);
  }

  accountInfo(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'getOwnerInfoDashboard'
    };

    return this._request(endpoints.myAccount, formData);
  }

  enrollmentStatus(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'getEnrollment'
    };

    return this._request(endpoints.enrollmentStatus, formData);
  }

  serviceInfo(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'getOwnersVehiclesInfoService'
    };

    return this._request(endpoints.myAccount, formData);
  }

  pinStatus(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'getpinstatus'
    };

    return this._request(endpoints.myAccount, formData);
  }

  subscriptionStatus(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'getproductCatalogDetails'
    };

    return this._request(endpoints.subscriptions, formData);
  }

  status(): Promise<HyundaiResponse|null> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      services: 'getVehicleStatus', // THIS IS WHAT HAPPENS WHEN YOU MAKE A PRO TYPO.... services (plural)
      gen: 2,
      regId: this.vin,
      refresh: false // I think this forces the their API to connect to the vehicle and pull the status
    };

    return this._request(endpoints.status, formData);
  }

  async _request(endpoint, data): Promise<HyundaiResponse|null> {

    // handle token refresh if we need to
    await this.bluelinky.handleTokenRefresh();

    const merged = Object.assign({
      vin: this.vin,
      username: this.username,
      pin: this.pin,
      token: this.token
    }, data);

    const formData = buildFormData(merged);

    const response = await got(endpoint, {
      method: 'POST',
      body: formData,
    });

    try {

      let {
        RESPONSE_STRING: result,
        E_IFFAILMSG: errorMessage,
        E_IFRESULT: status,
        ENROLLMENT_DETAILS: enrollmentStatus,
        FEATURE_DETAILS: featureDetails
      } = JSON.parse(response.body);

      if(featureDetails !== undefined) {
        result = featureDetails
      }

      const res = { result, errorMessage, status };
      //console.log(response.body);
      return res;
      
      // const oldObj = JSON.parse(response.body);

      // const newObj = {
      //   result: oldObj.RESPONSE_STRING,
      //   status: oldObj.E_IFRESULT,
      //   errorMessage: null
      // };

      // if(oldObj.ENROLLMENT_DETAILS !== undefined) {
      //   newObj.result = oldObj.ENROLLMENT_DETAILS;
      // }

      // if(oldObj.FEATURE_DETAILS !== undefined) {
      //   newObj.result = oldObj.FEATURE_DETAILS;
      // }

      // if(newObj.status !== 'Z:Success') {
      //   newObj.errorMessage = oldObj.E_IFFAILMSG;
      // }


    } catch (e) {
      return null;
    }
  }
}

export async function login(authConfig: AuthConfig): Promise<BlueLinky> {

  const instance = new BlueLinky(authConfig);
  const request = await instance.getToken();
  const expires = Math.floor((+new Date()/1000) + parseInt(request.expires_in, 10));

  instance.accessToken = request.access_token;
  instance.tokenExpires = expires;

  return instance;
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
        username: this.authConfig.username,
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

  // I thiunk this would be good enough as teh vehcile class will check when the token expires before doing a request
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
    let response;

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
