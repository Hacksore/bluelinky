import BlueLinky from './index';

export interface AuthConfig {
  username: string|null;
  password: string|null;
}

export interface StartConfig {
  airCtrl?: boolean|string;
  igniOnDuration: number;
  airTempvalue?: number;
  defrost?: boolean|string;
  heating1?: boolean|string;
}

export interface HyundaiResponse {
  status: string;
  result: any;
  errorMessage: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  username: string;
}

export interface VehicleConfig {
  vin: string|null;
  pin: string|null;
  token: string|null;
  bluelinky: BlueLinky;
}

export interface VehicleStatus {
  dateTime: string;
  acc: boolean;
  trunkOpen: boolean;
  doorLock: boolean;
  defrostStatus: string;
  transCond: boolean;
  doorLockStatus: string;
  doorOpen: { frontRight: number, frontLeft: number, backLeft: number, backRight: number };
  airCtrlOn: boolean;
  airTemp: { unit: number, hvacTempType: number, value: string };
  battery: {
    batSignalReferenceValue: {};
    batSoc: number;
    batState: number;
    sjbDeliveryMode: number
  };
  ign3: boolean;
  ignitionStatus: string;
  lowFuelLight: boolean;
  sideBackWindowHeat: number;
  dte: { unit: number, value: number };
  engine: boolean;
  defrost: boolean;
  hoodOpen: boolean;
  airConditionStatus: string;
  steerWheelHeat: number;
  tirePressureLamp: {
    tirePressureWarningLampRearLeft: number,
    tirePressureWarningLampFrontLeft: number,
    tirePressureWarningLampFrontRight: number,
    tirePressureWarningLampAll: number,
    tirePressureWarningLampRearRight: number
  };
  trunkOpenStatus: string;
}
