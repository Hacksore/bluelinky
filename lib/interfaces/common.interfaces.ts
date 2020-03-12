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
  mtspServiceDate: string;
  imatServiceOdometer: number;
  imatServiceOdometerUnit: number;
  mtitServiceDate: string;
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
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface AccountInfo {
  firstName: string;
  lastName: string;
  notificationEmail: string;
  phones: { 
    primary: string | null;
    secondary: string | null;
  };
  addresses: {
    primary: Address | null;
    secondary: Address | null;
  };
  preference: { 
    odometerUnit: number;
    climateUnit: string;  // "C" / "F"
    languageId: number;
    maintenanceAlert: boolean;
    preferredDealer: PreferedDealer | null;
    promotionMessage: string | null;
  };
}

// PreferedDealer
export interface PreferedDealerHour {
  dayCode: number;
  startTime: string;
  startTimeUnit: string;
  endTime: string;
  endTimeUnit: string;
}

export interface PreferedDealer {
  dealerCode: string;
  dealerName: string;
  street: string;
  province: string;
  city: string;
  postalCode: string;
  tel: string;
  fax: string;
  fullAddress: string;
  distance: string;
  lat: string;
  lng: string;
  webSite: string;
  salesHourList: [PreferedDealerHour];
  serviceHourList: [PreferedDealerHour];
}
