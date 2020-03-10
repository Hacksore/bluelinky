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

export interface VehcileStatusReponse {
  vehicleStatus: VehicleStatus;
  vehicleLocation: VehicleLocation;
  odometer: Odometer;
}

export interface ClimateConfig {
  defrost: boolean;
  windscreenHeating: boolean;
  temperature: number;
  unit: string;
}
