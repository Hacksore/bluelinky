/**
 * bluelinky (https://github.com/hacksore/bluelinky)
 *
 * MIT License
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var got = _interopDefault(require('got'));
var FormData = _interopDefault(require('form-data'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

var domain;

// This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).
function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}

// nodejs oddity
// require('events') === require('events').EventEmitter
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active && !(this instanceof domain.Domain)) ;
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  domain = this.domain;

  // If there is no 'error' event listener then throw.
  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er)
        er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] :
                                          [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + type + ' listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || (list.listener && list.listener === listener)) {
        if (--this._eventsCount === 0)
          this._events = new EventHandlers();
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (list.length === 1) {
          list[0] = undefined;
          if (--this._eventsCount === 0) {
            this._events = new EventHandlers();
            return this;
          } else {
            delete events[type];
          }
        } else {
          spliceOne(list, position);
        }

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        do {
          this.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

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
function buildFormData(config) {
    var form = new FormData();
    for (var key in config) {
        var value = config[key];
        if (typeof value !== 'object') {
            form.append(key, value.toString());
        }
    }
    return form;
}
var Vehicle = /** @class */ (function () {
    function Vehicle(config) {
        this._currentFeatures = {};
        this._vin = config.vin;
        this._pin = config.pin;
        this._eventEmitter = new EventEmitter();
        this._bluelinky = config.bluelinky;
        this.onInit();
    }
    Vehicle.prototype.addFeature = function (featureName, state) {
        this._currentFeatures[featureName] = (state === 'ON' ? true : false);
    };
    Vehicle.prototype.onInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.features()];
                    case 1:
                        response = _a.sent();
                        if (response.result === 'E:Failure' || response.result !== undefined) {
                            response.result.forEach(function (item) {
                                _this.addFeature(item.featureName, item.featureStatus);
                            });
                        }
                        // we tell the vehicle it's loaded :D
                        this._eventEmitter.emit('ready');
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Vehicle.prototype, "vin", {
        get: function () {
            return this._vin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vehicle.prototype, "eventEmitter", {
        get: function () {
            return this._eventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Vehicle.prototype.hasFeature = function (featureName) {
        return this._currentFeatures[featureName];
    };
    Vehicle.prototype.getFeatures = function () {
        return this._currentFeatures;
    };
    Vehicle.prototype.unlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasFeature('DOOR UNLOCK')) {
                            throw new Error('Vehicle does not have the unlock feature');
                        }
                        formData = {
                            gen: 2,
                            regId: this.vin,
                            service: 'remoteunlock'
                        };
                        return [4 /*yield*/, this._request(endpoints.remoteAction, formData)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.lock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasFeature('DOOR LOCK')) {
                            throw new Error('Vehicle does not have the lock feature');
                        }
                        return [4 /*yield*/, this._request(endpoints.remoteAction, {
                                gen: 2,
                                regId: this.vin,
                                service: 'remotelock'
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.start = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.remoteAction, __assign({ gen: 2, regId: this.vin, service: 'ignitionstart' }, config))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.remoteAction, {
                            gen: 2,
                            regId: this.vin,
                            service: 'ignitionstop'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.flashLights = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.remoteAction, {
                            gen: 2,
                            regId: this.vin,
                            service: 'light'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.panic = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.remoteAction, {
                            gen: 2,
                            regId: this.vin,
                            service: 'horn'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.health = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.health, {
                            service: 'getRecMaintenanceTimeline'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.apiUsageStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.usageStats, {
                            startdate: 20140401,
                            enddate: 20190611,
                            service: 'getUsageStats'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING.OUT_DATA,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.messages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.messageCenter, {
                            service: 'messagecenterservices'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING.results,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.accountInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.myAccount, {
                            service: 'getOwnerInfoDashboard'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.features = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.enrollmentStatus, {
                            service: 'getEnrollment'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.FEATURE_DETAILS.featureDetails,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.serviceInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.myAccount, {
                            service: 'getOwnersVehiclesInfoService'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.OwnerInfo,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.pinStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.myAccount, {
                            service: 'getpinstatus'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.subscriptionStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.subscriptions, {
                            service: 'getproductCatalogDetails'
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING.OUT_DATA.PRODUCTCATALOG,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype.status = function (refresh) {
        if (refresh === void 0) { refresh = false; }
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request(endpoints.status, {
                            services: 'getVehicleStatus',
                            gen: 2,
                            regId: this.vin,
                            refresh: refresh // I think this forces the their API to connect to the vehicle and pull the status
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                result: response.RESPONSE_STRING.vehicleStatus,
                                status: response.E_IFRESULT,
                                errorMessage: response.E_IFFAILMSG
                            }];
                }
            });
        });
    };
    Vehicle.prototype._request = function (endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            var merged, formData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // handle token refresh if we need to
                    return [4 /*yield*/, this._bluelinky.handleTokenRefresh()];
                    case 1:
                        // handle token refresh if we need to
                        _a.sent();
                        merged = Object.assign({
                            vin: this.vin,
                            username: this._bluelinky.username,
                            pin: this._pin,
                            url: 'https://owners.hyundaiusa.com/us/en/page/dashboard.html',
                            token: this._bluelinky.accessToken
                        }, data);
                        formData = buildFormData(merged);
                        return [4 /*yield*/, got(endpoint, {
                                method: 'POST',
                                body: formData,
                            })];
                    case 2:
                        response = _a.sent();
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
    return Vehicle;
}());
var BlueLinky = /** @class */ (function () {
    function BlueLinky(authConfig) {
        this.authConfig = {
            username: null,
            password: null
        };
        this._accessToken = null;
        this._tokenExpires = null;
        this._vehicles = [];
        this.authConfig = authConfig;
    }
    BlueLinky.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, expires;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getToken()];
                    case 1:
                        response = _a.sent();
                        expires = Math.floor((+new Date() / 1000) + parseInt(response.expires_in, 10));
                        this.accessToken = response.access_token;
                        this.tokenExpires = expires;
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(BlueLinky.prototype, "accessToken", {
        get: function () {
            return this._accessToken;
        },
        set: function (token) {
            this._accessToken = token;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlueLinky.prototype, "tokenExpires", {
        get: function () {
            return this._tokenExpires || 0;
        },
        set: function (unixtime) {
            this._tokenExpires = unixtime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlueLinky.prototype, "username", {
        get: function () {
            return this.authConfig.username;
        },
        enumerable: true,
        configurable: true
    });
    BlueLinky.prototype.getVehicles = function () {
        return this._vehicles;
    };
    BlueLinky.prototype.getVehicle = function (vin) {
        return this._vehicles.find(function (item) { return vin === item.vin; });
    };
    BlueLinky.prototype.registerVehicle = function (vin, pin) {
        if (!this.getVehicle(vin)) {
            var vehicle_1 = new Vehicle({
                vin: vin,
                pin: pin,
                token: this.accessToken,
                bluelinky: this
            });
            this._vehicles.push(vehicle_1);
            return new Promise(function (resolve, reject) {
                vehicle_1.eventEmitter.on('ready', function () { return resolve(vehicle_1); });
            });
        }
        return Promise.resolve(null);
    };
    // I think this would be good enough as teh vehcile class will check when the token expires before doing a request
    // if it is at or over the time it should tell it's dad to get a new token
    BlueLinky.prototype.handleTokenRefresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentTime = Math.floor((+new Date() / 1000));
                        if (!(currentTime >= (this.tokenExpires - 60))) return [3 /*break*/, 2];
                        console.log('token is expired, refreshing access token');
                        return [4 /*yield*/, this.getToken()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
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
                        return [2 /*return*/, json.Token];
                }
            });
        });
    };
    return BlueLinky;
}());

module.exports = BlueLinky;
