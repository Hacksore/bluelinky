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
        const value = config[key];
        if (typeof value !== 'object') {
            form.append(key, value.toString());
        }
    }
    return form;
}
class Vehicle {
    constructor(config) {
        this._currentFeatures = {};
        this._vin = config.vin;
        this._pin = config.pin;
        this._eventEmitter = new events_1.EventEmitter();
        this._bluelinky = config.bluelinky;
        this.onInit();
    }
    addFeature(featureName, state) {
        this._currentFeatures[featureName] = (state === 'ON' ? true : false);
    }
    onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.features();
            if (response.result === 'E:Failure' || response.result !== undefined) {
                response.result.forEach(item => {
                    this.addFeature(item.featureName, item.featureStatus);
                });
            }
            // we tell the vehicle it's loaded :D
            this._eventEmitter.emit('ready');
        });
    }
    get vin() {
        return this._vin;
    }
    get eventEmitter() {
        return this._eventEmitter;
    }
    hasFeature(featureName) {
        return this._currentFeatures[featureName];
    }
    getFeatures() {
        return this._currentFeatures;
    }
    unlock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasFeature('DOOR UNLOCK')) {
                throw new Error('Vehicle does not have the unlock feature');
            }
            const formData = {
                gen: 2,
                regId: this.vin,
                service: 'remoteunlock'
            };
            const response = yield this._request(endpoints.remoteAction, formData);
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    lock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasFeature('DOOR LOCK')) {
                throw new Error('Vehicle does not have the lock feature');
            }
            const response = yield this._request(endpoints.remoteAction, {
                gen: 2,
                regId: this.vin,
                service: 'remotelock'
            });
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    start(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.remoteAction, Object.assign({ gen: 2, regId: this.vin, service: 'ignitionstart' }, config));
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.remoteAction, {
                gen: 2,
                regId: this.vin,
                service: 'ignitionstop'
            });
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    flashLights() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.remoteAction, {
                gen: 2,
                regId: this.vin,
                service: 'light'
            });
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    panic() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.remoteAction, {
                gen: 2,
                regId: this.vin,
                service: 'horn'
            });
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    health() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.health, {
                service: 'getRecMaintenanceTimeline'
            });
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    apiUsageStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.usageStats, {
                startdate: 20140401,
                enddate: 20190611,
                service: 'getUsageStats'
            });
            return {
                result: response.RESPONSE_STRING.OUT_DATA,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    messages() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.messageCenter, {
                service: 'messagecenterservices'
            });
            return {
                result: response.RESPONSE_STRING.results,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    accountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.myAccount, {
                service: 'getOwnerInfoDashboard'
            });
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    features() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.enrollmentStatus, {
                service: 'getEnrollment'
            });
            return {
                result: response.FEATURE_DETAILS.featureDetails,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    serviceInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.myAccount, {
                service: 'getOwnersVehiclesInfoService'
            });
            return {
                result: response.OwnerInfo,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    pinStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.myAccount, {
                service: 'getpinstatus'
            });
            return {
                result: response.RESPONSE_STRING,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    subscriptionStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.subscriptions, {
                service: 'getproductCatalogDetails'
            });
            return {
                result: response.RESPONSE_STRING.OUT_DATA.PRODUCTCATALOG,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._request(endpoints.status, {
                services: 'getVehicleStatus',
                gen: 2,
                regId: this.vin,
                refresh: false // I think this forces the their API to connect to the vehicle and pull the status
            });
            return {
                result: response.RESPONSE_STRING.vehicleStatus,
                status: response.E_IFRESULT,
                errorMessage: response.E_IFFAILMSG
            };
        });
    }
    _request(endpoint, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // handle token refresh if we need to
            yield this._bluelinky.handleTokenRefresh();
            const merged = Object.assign({
                vin: this.vin,
                username: this._bluelinky.username,
                pin: this._pin,
                url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                token: this._bluelinky.accessToken
            }, data);
            const formData = buildFormData(merged);
            const response = yield got(endpoint, {
                method: 'POST',
                body: formData,
            });
            try {
                return JSON.parse(response.body);
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
    get username() {
        return this.authConfig.username;
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
