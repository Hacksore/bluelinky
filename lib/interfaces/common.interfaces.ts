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
  dateTime: string;
  acc: boolean;
  trunkOpen: boolean;
  doorLock: boolean;
  defrostStatus: string;
  transCond: boolean;
  doorLockStatus: string;
  doorOpen: { frontRight: number; frontLeft: number; backLeft: number; backRight: number };
  airCtrlOn: boolean;
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
