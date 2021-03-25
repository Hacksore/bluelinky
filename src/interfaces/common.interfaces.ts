import { REGIONS } from '../constants';

export type Brand = 'kia' | 'hyundai';

// config
export interface BlueLinkyConfig {
  username: string | undefined;
  password: string | undefined;
  region: REGIONS | undefined;
  brand: Brand;
  autoLogin?: boolean;
  pin: string | undefined;
  vin?: string | undefined;
  vehicleId?: string | undefined;
}

export interface BluelinkVehicle {
  name: string;
  vin: string;
  type: string;
}

export interface Session {
  accessToken?: string;
  refreshToken?: string;
  controlToken?: string;
  deviceId?: string;
  tokenExpiresAt: number;
  controlTokenExpiresAt?: number;
}

export enum EVPlugTypes {
  UNPLUGED = 0,
  FAST = 1,
  PORTABLE = 2,
  STATION = 3
}

export enum EVChargeModeTypes {
  FAST = 0,
  SLOW = 1,
}

// Status remapped
export interface VehicleStatus {
  engine: {
    ignition: boolean;
    batteryCharge?: number;
    charging?: boolean;
    timeToFullCharge?: unknown;
    range: number;
    rangeGas?: number;
    rangeEV?: number;
    plugedTo? : EVPlugTypes;
    estimatedCurrentChargeDuration?: number;
    estimatedFastChargeDuration?: number;
    estimatedPortableChargeDuration?: number;
    estimatedStationChargeDuration?: number;
    batteryCharge12v?: number;
    batteryChargeHV?: number;
    accessory: boolean;
  };
  climate: {
    active: boolean;
    steeringwheelHeat: boolean;
    sideMirrorHeat: boolean;
    rearWindowHeat: boolean;
    temperatureSetpoint: number;
    temperatureUnit: number;
    defrost: boolean;
  };
  chassis: {
    hoodOpen: boolean;
    trunkOpen: boolean;
    locked: boolean;
    openDoors: {
      frontRight: boolean;
      frontLeft: boolean;
      backLeft: boolean;
      backRight: boolean;
    };
    tirePressureWarningLamp: {
      rearLeft: boolean;
      frontLeft: boolean;
      frontRight: boolean;
      rearRight: boolean;
      all: boolean;
    };
  };
  lastupdate: Date
}

// TODO: fix/update
export interface FullVehicleStatus {
  vehicleLocation: {
    coord: { lat: number; lon: number; alt: number; type: number };
    head: number;
    speed: { value: number; unit: number };
    accuracy: { hdop: number; pdop: number };
    time: string;
  };
  odometer: { value: number, unit: number };
  vehicleStatus: {
    time: string;
    airCtrlOn: boolean;
    engine: boolean;
    doorLock: boolean;
    doorOpen: { frontRight: number; frontLeft: number; backLeft: number; backRight: number };
    trunkOpen: boolean;
    airTemp: { unit: number; hvacTempType: number; value: string };
    defrost: boolean;
    acc: boolean;
    ign3: boolean;
    hoodOpen: boolean;
    transCond: boolean;
    steerWheelHeat: number;
    sideBackWindowHeat: number;
    tirePressureLamp: {
      tirePressureWarningLampAll: number;
      tirePressureWarningLampFL: number;
      tirePressureWarningLampFR: number;
      tirePressureWarningLampRL: number;
      tirePressureWarningLampRR: number;
    };
    battery: { batSoc: number; batState: number; };
    evStatus: {
      batteryCharge: boolean;
      batteryStatus: number;
      batteryPlugin: number;
      remainTime2: { 
        etc1: { value: number; unit: number; };
        etc2: { value: number; unit: number; };
        etc3: { value: number; unit: number; };
        atc: { value: number; unit: number; };
      };
      drvDistance: [
        {
          rangeByFuel: {
            gasModeRange: { value: number; unit: number };
            evModeRange: { value: number; unit: number };
            totalAvailableRange: { value: number; unit: number };
          };
          type: number;
        }
      ];
      // "reservChargeInfos": {
      //   "reservChargeInfo": {
      //     "reservChargeInfoDetail": {
      //       "reservInfo": {
      //         "day": [
      //           1,
      //           2,
      //           3,
      //           4,
      //           5
      //         ],
      //         "time": {
      //           "time": "0800",
      //           "timeSection": 0
      //         }
      //       },
      //       "reservChargeSet": true,
      //       "reservFatcSet": {
      //         "defrost": false,
      //         "airTemp": {
      //           "value": "00H",
      //           "unit": 0,
      //           "hvacTempType": 1
      //         },
      //         "airCtrl": 0,
      //         "heating1": 0
      //       }
      //     }
      //   },
      //   "offpeakPowerInfo": {
      //     "offPeakPowerTime1": {
      //       "starttime": {
      //         "time": "1200",
      //         "timeSection": 0
      //       },
      //       "endtime": {
      //         "time": "1200",
      //         "timeSection": 0
      //       }
      //     },
      //     "offPeakPowerFlag": 1
      //   },
      //   "reserveChargeInfo2": {
      //     "reservChargeInfoDetail": {
      //       "reservInfo": {
      //         "day": [
      //           9
      //         ],
      //         "time": {
      //           "time": "1200",
      //           "timeSection": 0
      //         }
      //       },
      //       "reservChargeSet": false,
      //       "reservFatcSet": {
      //         "defrost": false,
      //         "airTemp": {
      //           "value": "00H",
      //           "unit": 0,
      //           "hvacTempType": 1
      //         },
      //         "airCtrl": 0,
      //         "heating1": 0
      //       }
      //     }
      //   },
      //   "reservFlag": 0,
      //   "ect": {
      //     "start": {
      //       "day": 9,
      //       "time": {
      //         "time": "1200",
      //         "timeSection": 0
      //       }
      //     },
      //     "end": {
      //       "day": 9,
      //       "time": {
      //         "time": "1200",
      //         "timeSection": 0
      //       }
      //     }
      //   },
      //   "targetSOClist": [
      //     {
      //       "targetSOClevel": 90,
      //       "dte": {
      //         "rangeByFuel": {
      //           "evModeRange": {
      //             "value": 392,
      //             "unit": 1
      //           },
      //           "totalAvailableRange": {
      //             "value": 392,
      //             "unit": 1
      //           }
      //         },
      //         "type": 2
      //       },
      //       "plugType": 0
      //     },
      //     {
      //       "targetSOClevel": 80,
      //       "dte": {
      //         "rangeByFuel": {
      //           "evModeRange": {
      //             "value": 345,
      //             "unit": 1
      //           },
      //           "totalAvailableRange": {
      //             "value": 345,
      //             "unit": 1
      //           }
      //         },
      //         "type": 2
      //       },
      //       "plugType": 1
      //     }
      //   ]
      // }
    };
  }
}

// TODO: remove
// =======
// Rough mapping of the raw status that might no be the same for all regions

export interface RawVehicleStatus {
  lastStatusDate: string;
  dateTime: string;
  acc: boolean;
  trunkOpen: boolean;
  doorLock: boolean;
  defrostStatus: string;
  transCond: boolean;
  doorLockStatus: string;
  doorOpen: { frontRight: number; frontLeft: number; backLeft: number; backRight: number };
  airCtrlOn: boolean;
  airTempUnit: string;
  airTemp: { unit: number; hvacTempType: number; value: string };
  battery: {
    batSignalReferenceValue: unknown;
    batSoc: number;
    batState: number;
    sjbDeliveryMode: number;
  };
  ign3: boolean;
  ignitionStatus: string;
  lowFuelLight: boolean;
  sideBackWindowHeat: number;
  dte: { unit: number; value: number };
  engine: boolean;
  defrost: boolean;
  hoodOpen: boolean;
  airConditionStatus: string;
  steerWheelHeat: number;
  tirePressureLamp: {
    tirePressureWarningLampRearLeft: number;
    tirePressureWarningLampFrontLeft: number;
    tirePressureWarningLampFrontRight: number;
    tirePressureWarningLampAll: number;
    tirePressureWarningLampRearRight: number;
  };
  trunkOpenStatus: string;
  evStatus: {
    batteryCharge: boolean;
    batteryStatus: number;
    batteryPlugin: number;
    remainTime2: {
      etc1: { value: number; unit: number };
      etc2: { value: number; unit: number };
      etc3: { value: number; unit: number };
      atc: { value: number; unit: number };
    };
    drvDistance: [
      {
        rangeByFuel: {
          gasModeRange: { value: number; unit: number };
          evModeRange: { value: number; unit: number };
          totalAvailableRange: { value: number; unit: number };
        };
        type: number;
      }
    ];
  };
  remoteIgnition: boolean;
  seatHeaterVentInfo: unknown;
  sleepModeCheck: boolean;
  lampWireStatus: {
    headLamp: unknown;
    stopLamp: unknown;
    turnSignalLamp: unknown;
  };
  windowOpen: unknown;
  engineRuntime: unknown;
}

// Vehicle Info
export interface VehicleInfo {
  vehicleId: string;
  nickName: string;
  modelCode: string;
  modelName: string;
  modelYear: string;
  fuelKindCode: string;
  trim: string;
  engine: string;
  exteriorColor: string;
  dtcCount: number;
  subscriptionStatus: string;
  subscriptionEndDate: string;
  overviewMessage: string;
  odometer: number;
  odometerUnit: number;
  defaultVehicle: boolean;
  enrollmentStatus: string;
  genType: string;
  transmissionType: string;
  vin: string;
}

export interface VehicleFeatureEntry {
  category: string;
  features: [
    {
      featureName: string;
      features: [
        {
          subFeatureName: string;
          subFeatureValue: string;
        }
      ];
    }
  ];
}

// Location
export interface VehicleLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: {
    unit: number;
    value: number;
  };
  heading: number;
}
export interface VehicleOdometer {
  unit: number;
  value: number;
}

export interface VehicleStatusOptions {
  refresh: boolean;
  parsed: boolean;
}


// VEHICLE COMMANDS /////////////////////////////////////////////
export interface VehicleCommandResponse {
  responseCode: number; // 0 is success
  responseDesc: string;
}

export interface VehicleStartOptions {
  airCtrl?: boolean | string;
  igniOnDuration: number;
  airTempvalue?: number;
  defrost?: boolean | string;
  heating1?: boolean | string;
}

export interface VehicleClimateOptions {
  defrost: boolean;
  windscreenHeating: boolean;
  temperature: number;
  unit: string;
}

export interface VehicleRegisterOptions {
  nickname: string;
  name: string;
  vin: string;
  regDate: string;
  brandIndicator: string;
  regId: string;
  id: string;
  generation: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface VehicleMonthlyReport {
  start: string; // format YYYYMMDD, eg: 20210210
  end: string; // format YYYYMMDD, eg: 20210312
  driving: {
    distance: number;
    startCount: number;
    durations: {
      drive: number;
      idle: number;
    }
  },
  breakdown: {
    ecuIdx: string;
    ecuStatus: string;
  }[],
  vehicleStatus: {
    tpms: boolean;
    tirePressure: {
      all: boolean;
    }
  }
}

export interface VehicleTargetSOC {
  type: EVChargeModeTypes;
  distance: number;
  targetLevel: number;
}

export interface VehicleDayTrip {
  dayRaw: string;
  tripsCount: number;
  distance: number;
  durations: {
    drive: number;
    idle: number;
  };
  speed: {
    avg: number;
    max: number;
  };
  trips: {
    timeRaw: string;
    start: Date;
    end: Date;
    durations: {
      drive: number;
      idle: number;
    };
    speed: {
      avg: number;
      max: number;
    };
    distance: number;
  }[];
}