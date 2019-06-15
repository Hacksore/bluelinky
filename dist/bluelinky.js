"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const got = require("got");
const FormData = require("form-data");
const events_1 = require("events");
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
function buildFormData(config) {
    const form = new FormData();
    for (const key in config) {
        const value = config[key].toString();
        form.append(key, value);
    }
    return form;
}
class Vehicle {
    constructor(config) {
        this.currentFeatures = {};
        this.vin = config.vin;
        this.pin = config.pin;
        this.username = config.username;
        this.token = config.token;
        this.eventEmitter = new events_1.EventEmitter();
        this.bluelinky = config.bluelinky;
        this.onInit();
    }
    onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.vin + ' is loading...');
            const response = yield this.enrollmentStatus();
            console.log(response);
            if (response.result === 'E:Failure' || response.result.featureDetails !== undefined) {
                response.result.featureDetails.forEach(item => {
                    this.currentFeatures[item.featureName] = (item.featureStatus === 'ON' ? true : false);
                });
            }
            // we tell the vehicle it's loaded :D
            this.eventEmitter.emit('ready');
        });
    }
    hasFeature(featureName) {
        return this.currentFeatures[featureName];
    }
    unlock() {
        if (!this.hasFeature('DOOR UNLOCK')) {
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
    lock() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            gen: 2,
            regId: 'H00002548087V' + this.vin,
            service: 'remotelock'
        };
        return this._request(endpoints.remoteAction, formData);
    }
    startVehicle(config) {
        const formData = Object.assign({
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            gen: 2,
            regId: this.vin,
            service: 'ignitionstart'
        }, config);
        return this._request(endpoints.remoteAction, formData);
    }
    stopVehicle() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            gen: 2,
            regId: this.vin,
            service: 'ignitionstop'
        };
        return this._request(endpoints.remoteAction, formData);
    }
    flashLights() {
        const formData = buildFormData({
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            gen: 2,
            regId: this.vin,
            service: 'light'
        });
        return this._request(endpoints.remoteAction, formData);
    }
    panic() {
        const formData = buildFormData({
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            gen: 2,
            regId: this.vin,
            service: 'horn'
        });
        return this._request(endpoints.remoteAction, formData);
    }
    health() {
        const formData = {
            vin: this.vin,
            url: 'https://owners.hyundaiusa.com/us/en/page/vehicle-health.html',
            service: 'getRecMaintenanceTimeline'
        };
        return this._request(endpoints.health, formData);
    }
    apiUsageStatus() {
        const formData = {
            startdate: 20140401,
            enddate: 20190611,
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            service: 'getUsageStats'
        };
        return this._request(endpoints.usageStats, formData);
    }
    messages() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            service: 'messagecenterservices'
        };
        return this._request(endpoints.messageCenter, formData);
    }
    accountInfo() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            service: 'getOwnerInfoDashboard'
        };
        return this._request(endpoints.myAccount, formData);
    }
    enrollmentStatus() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            service: 'getEnrollment'
        };
        return this._request(endpoints.enrollmentStatus, formData);
    }
    serviceInfo() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            service: 'getOwnersVehiclesInfoService'
        };
        return this._request(endpoints.myAccount, formData);
    }
    pinStatus() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            service: 'getpinstatus'
        };
        return this._request(endpoints.myAccount, formData);
    }
    subscriptionStatus() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            service: 'getproductCatalogDetails'
        };
        return this._request(endpoints.subscriptions, formData);
    }
    status() {
        const formData = {
            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
            services: 'getVehicleStatus',
            gen: 2,
            regId: this.vin,
            refresh: false // I think this forces the their API to connect to the vehicle and pull the status
        };
        return this._request(endpoints.status, formData);
    }
    _request(endpoint, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // handle token refresh if we need to
            yield this.bluelinky.handleTokenRefresh();
            const merged = Object.assign({
                vin: this.vin,
                username: this.username,
                pin: this.pin,
                token: this.token
            }, data);
            const formData = buildFormData(merged);
            const response = yield got(endpoint, {
                method: 'POST',
                body: formData,
            });
            try {
                let { RESPONSE_STRING: result, E_IFFAILMSG: errorMessage, E_IFRESULT: status, ENROLLMENT_DETAILS: enrollmentStatus, FEATURE_DETAILS: featureDetails } = JSON.parse(response.body);
                if (featureDetails !== undefined) {
                    result = featureDetails;
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
            }
            catch (e) {
                return null;
            }
        });
    }
}
function login(authConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = new BlueLinky(authConfig);
        const request = yield instance.getToken();
        const expires = Math.floor((+new Date() / 1000) + parseInt(request.expires_in, 10));
        instance.accessToken = request.access_token;
        instance.tokenExpires = expires;
        return instance;
    });
}
exports.login = login;
class BlueLinky {
    constructor(authConfig) {
        this.authConfig = {
            username: null,
            password: null
        };
        this._accessToken = null;
        this._tokenExpires = null;
        this._vehicles = [];
        this.authConfig = authConfig;
    }
    get accessToken() {
        return this._accessToken;
    }
    set accessToken(token) {
        this._accessToken = token;
    }
    set tokenExpires(unixtime) {
        this._tokenExpires = unixtime;
    }
    get tokenExpires() {
        return this._tokenExpires || 0;
    }
    getVehicles() {
        return this._vehicles;
    }
    getVehicle(vin) {
        return this._vehicles.find(item => vin === item.vin);
    }
    registerVehicle(vin, pin) {
        if (!this.getVehicle(vin)) {
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
    handleTokenRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = Math.floor((+new Date() / 1000));
            // refresh 60 seconds before timeout
            if (currentTime >= (this.tokenExpires - 60)) {
                console.log('token is expired, refreshing access token');
                yield this.getToken();
            }
        });
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            const now = Math.floor(+new Date() / 1000);
            response = yield got(endpoints.getToken + now, {
                method: 'GET',
                json: true
            });
            const csrfToken = response.body.token;
            response = yield got(endpoints.validateToken, {
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
            response = yield got(endpoints.auth, {
                method: 'POST',
                body: formData
            });
            const json = JSON.parse(response.body);
            return json.Token;
        });
    }
}
