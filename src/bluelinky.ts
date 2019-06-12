import * as got from 'got';
import * as FormData from 'form-data';

const endpoints = {
  getToken: 'https://owners.hyundaiusa.com/etc/designs/ownercommon/us/token.json?reg=',
  validateToken: 'https://owners.hyundaiusa.com/libs/granite/csrf/token.json',
  auth: 'https://owners.hyundaiusa.com/bin/common/connectCar',
  remoteAction: 'https://owners.hyundaiusa.com/bin/common/remoteAction',
  usageStats: 'https://owners.hyundaiusa.com/bin/common/usagestats',
  health: 'https://owners.hyundaiusa.com/bin/common/VehicleHealthServlet',
};

interface AuthConfig {
  vin: string|null,
  username: string|null,
  password: string|null,
  pin: string|null,
};

interface StartConfig {
  airCtrl: boolean,
  igniOnDuration: number,
  airTempvalue: number,
  defrost: boolean,
  heating1: boolean
}

interface HyundaiResponse {
  E_IFRESULT: string,
  E_IFFAILMSG: string,
  RESPONSE_STRING: JSON
}


function buildFormData(config) {
  const form = new FormData();
  for (const key in config) {
    form.append(key, config[key]);
  }
  return form;
}

class BlueLinky {

  private authConfig: AuthConfig = {vin: null, username: null, pin: null, password: null};
  private token: String|null = null;

  constructor(authConfig: AuthConfig) {
    this.setAuthConfig(authConfig);
  }

  setAuthConfig(config: AuthConfig): void {
    this.authConfig = config;
  }
 
  async getToken(): Promise<String> {
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
    return json.Token.access_token;

  }

  async unlockVehicle(): Promise<HyundaiResponse> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.authConfig.vin,
      service: 'remoteunlock'
    };

    return this._request(endpoints.remoteAction, formData);
  }

  async lockVehicle(): Promise<HyundaiResponse> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: 'H00002548087V' + this.authConfig.vin,
      service: 'remotelock'
    };

    return this._request(endpoints.remoteAction, formData);
  }

  async startVehicle(config: StartConfig): Promise<HyundaiResponse> {

    const formData = Object.assign({
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.authConfig.vin,
      service: 'ignitionstart'
    }, config);

    return this._request(endpoints.remoteAction, formData);
  }

  async stopVehicle(): Promise<HyundaiResponse> {

    const formData = {
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.authConfig.vin,
      service: 'ignitionstop'
    };

    return this._request(endpoints.remoteAction, formData);
  }

  async flashVehicleLights(): Promise<HyundaiResponse> {

    const formData = buildFormData({
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.authConfig.vin,
      service: 'light'
    });

    return this._request(endpoints.remoteAction, formData);
  }

  async vehiclePanic(): Promise<HyundaiResponse> {

    const formData = buildFormData({
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      gen: 2,
      regId: this.authConfig.vin,
      service: 'horn'
    });

    return this._request(endpoints.remoteAction, formData);
  }

  async vehicleHealth(): Promise<HyundaiResponse> {

    const formData = {
      vin: this.authConfig.vin,
      username: this.authConfig.username,
      url: 'https://owners.hyundaiusa.com/us/en/page/vehicle-health.html',
      service: 'getRecMaintenanceTimeline'
    };

    return this._request(endpoints.health, formData);
  }

  async apiUsageStatus(): Promise<HyundaiResponse> {

    const formData = {
      startdate: 20140401,
      enddate: 20190611,
      url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
      service: 'getUsageStats'
    };

    return this._request(endpoints.usageStats, formData);
  }

  async _request(endpoint, data): Promise<HyundaiResponse> {

    if(this.token === null) {
      this.token = await this.getToken();
    }

    const merged = Object.assign({
      vin: this.authConfig.vin,
      username: this.authConfig.username,
      pin: this.authConfig.pin,
      token: this.token
    }, data);

    const formData = buildFormData(merged);
    const response = await got(endpoint, {
      method: 'POST',
      body: formData,
    });

    return JSON.parse(response.body);
  }
}

export = BlueLinky;
