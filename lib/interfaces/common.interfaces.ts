// config
export interface BlueLinkyConfig {
  username: string|undefined;
  password: string|undefined;
  region: string|undefined;
  autoLogin: boolean;
  pin: string|undefined;
  vin: string|undefined;
  vehicleId: string|undefined;
  deviceUuid: string|undefined;
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
}

// Status
export interface VehicleStatus {
  lastStatusDate: String
  dateTime: string;
  acc: boolean;
  trunkOpen: boolean;
  doorLock: boolean;
  defrostStatus: string;
  transCond: boolean;
  doorLockStatus: string;
  doorOpen: { frontRight: number; frontLeft: number; backLeft: number; backRight: number };
  airCtrlOn: boolean;
  airTempUnit: String;
  airTemp: { unit: number; hvacTempType: number; value: string };
  battery: {
    batSignalReferenceValue: {};
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
    batteryCharge: Boolean;
    batteryStatus: number;
    batteryPlugin: number;
    remainTime2: {
      etc1: { value: number; unit: number; };
      etc2: { value: number; unit: number; };
      etc3: { value: number; unit: number; };
      atc: { value: number; unit: number; };
    };
    drvDistance: [{
      rangeByFuel: {
        gasModeRange: { value: number; unit: number; };
        evModeRange: { value: number; unit: number; };
        totalAvailableRange: { value: number; unit: number; };
      };
      type: number;
    }]
  };
  remoteIgnition: Boolean;
  seatHeaterVentInfo: {};
  sleepModeCheck: Boolean;
  lampWireStatus: {
    headLamp: {};
    stopLamp: {};
    turnSignalLamp: {};
  };
  windowOpen: {};
  engineRuntime: {}
}

// Vehicle Info
export interface VehicleInfo {
  vehicleId: String;
  nickName: String;
  modelCode: String;
  modelName: String;
  modelYear: String;
  fuelKindCode: String;
  trim: String;
  engine: String;
  exteriorColor: String;
  dtcCount: number;
  subscriptionStatus: String;
  subscriptionEndDate: String;
  overviewMessage: String;
  odometer: number;
  odometerUnit: number;
  defaultVehicle: Boolean;
  enrollmentStatus: String;
  genType: String;
  transmissionType: String;
  vin: String;
}

export interface VehicleFeatures {
  seatHeatVent : {
    drvSeatHeatOption: number;
    astSeatHeatOption: number;
    rlSeatHeatOption: number;
    rrSeatHeatOption: number;
  };
  hvacTempType: number;
  targetMinSoc: number;
}

export interface VehicleFeatureEntry {
  category: String;
  features: [ {
    featureName: String;
    features: [ {
      subFeatureName: String;
      subFeatureValue: String;
    }] 
  }] 
}
export interface VehicleFeaturesModel {
  features: [ VehicleFeatureEntry ]
}

export interface VehicleInfoResponse {
  vehicleInfo: VehicleInfo;
  features: VehicleFeatures;
  featuresModel: VehicleFeaturesModel
  status: VehicleStatus;
}

// Location
export interface VehicleLocation {
  accuracy: {
    hdop: number;
    pdop: number;
  };
  coord: {
      alt: number;
      lat: number;
      lon: number;
      type: number;
  };
  head: number;
  speed: {
      unit: number;
      value: number;
  };
  time: string;
}

export interface Odometer {
  unit: number;
  value: number;
}

// not used: ?
export interface VehicleStatusReponse {
  vehicleStatus: VehicleStatus;
  vehicleLocation: VehicleLocation;
  odometer: Odometer;
}

// Vehicle Next Service
export interface VehicleNextService {
  msopServiceOdometer: number;
  msopServiceOdometerUnit: number;
  mtspServiceDate: String;
  imatServiceOdometer: number;
  imatServiceOdometerUnit: number;
  mtitServiceDate: String;
  currentOdometer: number;
  currentOdometerUnit: number;
  serviceOdometerDuration: number;
  serviceDaysDuration: number;
  serviceMonthsThreshold: number;
}

// VEHICLE COMMANDS /////////////////////////////////////////////

export interface VehicleCommandResponse {
  responseCode: number;   // 0 is success
  responseDesc: String;
}

export interface StartConfig {
  airCtrl?: boolean | string;
  igniOnDuration: number;
  airTempvalue?: number;
  defrost?: boolean | string;
  heating1?: boolean | string;
}

export interface ClimateConfig {
  defrost: boolean;
  windscreenHeating: boolean;
  temperature: number;
  unit: string;
}

// ACCOUNT //////////////////////////////////////////////////////

// Account Info
export interface Address {
  street: String;
  city: String;
  province: String;
  postalCode: String;
}

export interface AccountInfo {
  firstName: String;
  lastName: String;
  notificationEmail: String;
  phones: { primary: String | null, secondary: String | null };
  addresses: { primary: Address | null, secondary: Address | null };
  preference: { 
    odometerUnit: number;
    climateUnit: String;  // "C" / "F"
    languageId: number;
    maintenanceAlert: boolean;
    preferredDealer: PreferedDealer | null;
    promotionMessage: String | null;
  };
}

// PreferedDealer
export interface PreferedDealerHour {
  dayCode: number;
  startTime: String;
  startTimeUnit: String;
  endTime: String;
  endTimeUnit: String
}

export interface PreferedDealer {
  dealerCode: String;
  dealerName: String;
  street: String;
  province: String;
  city: String;
  postalCode: String;
  tel: String;
  fax: String;
  fullAddress: String;
  distance: String;
  lat: String;
  lng: String;
  webSite: String;
  salesHourList: [PreferedDealerHour];
  serviceHourList: [PreferedDealerHour];
}
