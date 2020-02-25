import BlueLinky from '..';

export interface VehicleConfig {
  vin: string|null;
  pin: string|null;
  token: string|null;
  bluelinky: BlueLinky;
}

export interface BlueLinkyConfig {
  username: string|null;
  password: string|null;
  region: string|null;
  autoLogin: boolean|null;
  pin: string|null;
}

export interface BluelinkVehicle {
  name: string;
  vin: string;
  type: string;
}

export interface Session {
  accessToken?: string;
  controlToken?: string;
  deviceId?: string;
}
