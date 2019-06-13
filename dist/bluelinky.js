"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var got = require("got");
var FormData = require("form-data");
var endpoints = {
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
;
function buildFormData(config) {
    var form = new FormData();
    for (var key in config) {
        var value = config[key];
        if (typeof (value) === 'boolean') {
            value = value.toString();
        }
        form.append(key, value);
    }
    return form;
}
var BlueLinkUser = /** @class */ (function () {
    function BlueLinkUser() {
    }
    return BlueLinkUser;
}());
var Vehicle = /** @class */ (function () {
    //private vinNumber: string|null;
    function Vehicle(config) {
    }
    return Vehicle;
}());
var BlueLinky = /** @class */ (function () {
    function BlueLinky(authConfig) {
        this.authConfig = {
            vin: null,
            username: null,
            pin: null,
            password: null
        };
        this.token = null;
        this.authConfig = authConfig;
    }
    BlueLinky.prototype.getToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, now, csrfToken, formData, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = Math.floor(+new Date() / 1000);
                        return [4 /*yield*/, got(endpoints.getToken + now, {
                                method: 'GET',
                                json: true
                            })];
                    case 1:
                        response = _a.sent();
                        csrfToken = response.body.token;
                        return [4 /*yield*/, got(endpoints.validateToken, {
                                method: 'GET',
                                headers: {
                                    Cookie: "csrf_token=" + csrfToken + ";"
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        formData = buildFormData({
                            ':cq_csrf_token': csrfToken,
                            'username': this.authConfig.username,
                            'password': this.authConfig.password,
                            'url': 'https://owners.hyundaiusa.com/us/en/index.html'
                        });
                        return [4 /*yield*/, got(endpoints.auth, {
                                method: 'POST',
                                body: formData
                            })];
                    case 3:
                        response = _a.sent();
                        json = JSON.parse(response.body);
                        return [2 /*return*/, json.Token.access_token];
                }
            });
        });
    };
    BlueLinky.prototype.unlockVehicle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    gen: 2,
                    regId: this.authConfig.vin,
                    service: 'remoteunlock'
                };
                return [2 /*return*/, this._request(endpoints.remoteAction, formData)];
            });
        });
    };
    BlueLinky.prototype.lockVehicle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    gen: 2,
                    regId: 'H00002548087V' + this.authConfig.vin,
                    service: 'remotelock'
                };
                return [2 /*return*/, this._request(endpoints.remoteAction, formData)];
            });
        });
    };
    BlueLinky.prototype.startVehicle = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = Object.assign({
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    gen: 2,
                    regId: this.authConfig.vin,
                    service: 'ignitionstart'
                }, config);
                return [2 /*return*/, this._request(endpoints.remoteAction, formData)];
            });
        });
    };
    BlueLinky.prototype.stopVehicle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    gen: 2,
                    regId: this.authConfig.vin,
                    service: 'ignitionstop'
                };
                return [2 /*return*/, this._request(endpoints.remoteAction, formData)];
            });
        });
    };
    BlueLinky.prototype.flashVehicleLights = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = buildFormData({
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    gen: 2,
                    regId: this.authConfig.vin,
                    service: 'light'
                });
                return [2 /*return*/, this._request(endpoints.remoteAction, formData)];
            });
        });
    };
    BlueLinky.prototype.vehiclePanic = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = buildFormData({
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    gen: 2,
                    regId: this.authConfig.vin,
                    service: 'horn'
                });
                return [2 /*return*/, this._request(endpoints.remoteAction, formData)];
            });
        });
    };
    BlueLinky.prototype.vehicleHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    vin: this.authConfig.vin,
                    username: this.authConfig.username,
                    url: 'https://owners.hyundaiusa.com/us/en/page/vehicle-health.html',
                    service: 'getRecMaintenanceTimeline'
                };
                return [2 /*return*/, this._request(endpoints.health, formData)];
            });
        });
    };
    BlueLinky.prototype.apiUsageStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    startdate: 20140401,
                    enddate: 20190611,
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    service: 'getUsageStats'
                };
                return [2 /*return*/, this._request(endpoints.usageStats, formData)];
            });
        });
    };
    BlueLinky.prototype.messages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    service: 'messagecenterservices'
                };
                return [2 /*return*/, this._request(endpoints.messageCenter, formData)];
            });
        });
    };
    BlueLinky.prototype.accountInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    service: 'getOwnerInfoDashboard'
                };
                return [2 /*return*/, this._request(endpoints.myAccount, formData)];
            });
        });
    };
    BlueLinky.prototype.enrollmentStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    service: 'getEnrollment'
                };
                return [2 /*return*/, this._request(endpoints.enrollmentStatus, formData)];
            });
        });
    };
    BlueLinky.prototype.serviceInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    service: 'getOwnersVehiclesInfoService'
                };
                return [2 /*return*/, this._request(endpoints.myAccount, formData)];
            });
        });
    };
    BlueLinky.prototype.pinStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    service: 'getpinstatus'
                };
                return [2 /*return*/, this._request(endpoints.myAccount, formData)];
            });
        });
    };
    BlueLinky.prototype.subscriptionStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    service: 'getproductCatalogDetails'
                };
                return [2 /*return*/, this._request(endpoints.subscriptions, formData)];
            });
        });
    };
    BlueLinky.prototype.vehicleStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = {
                    url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                    services: 'getVehicleStatus',
                    gen: 2,
                    regId: this.authConfig.vin,
                    refresh: false
                };
                return [2 /*return*/, this._request(endpoints.status, formData)];
            });
        });
    };
    BlueLinky.prototype._request = function (endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, merged, formData, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.token === null)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.getToken()];
                    case 1:
                        _a.token = _b.sent();
                        _b.label = 2;
                    case 2:
                        merged = Object.assign({
                            vin: this.authConfig.vin,
                            username: this.authConfig.username,
                            pin: this.authConfig.pin,
                            token: this.token
                        }, data);
                        formData = buildFormData(merged);
                        return [4 /*yield*/, got(endpoint, {
                                method: 'POST',
                                body: formData,
                            })];
                    case 3:
                        response = _b.sent();
                        try {
                            return [2 /*return*/, JSON.parse(response.body)];
                        }
                        catch (e) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return BlueLinky;
}());
module.exports = BlueLinky;
