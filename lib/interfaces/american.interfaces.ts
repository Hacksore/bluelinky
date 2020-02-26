import BlueLinky from '../index';

export interface StartConfig {
  airCtrl?: boolean|string;
  igniOnDuration: number;
  airTempvalue?: number;
  defrost?: boolean|string;
  heating1?: boolean|string;
}

export interface HyundaiResponse {
  status: string;
  // I think this is dynamic so hard to type it?
  /* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface RegisterVehicleConfig {
  vin: string;
  pin: string;
  region: string|null;
}

export interface CanadianEndpoints {
  login: string;
  logout: string;
  list: string;
  lock: string;
  unlock: string;
  start: string;
  stop: string;
  myAccount: string;
  status: string;
  remoteStatus: string;
  verifyPin: string;
  verifyToken: string;
  vehicleInfo: string;
  nextService: string;
  preferedDealer: string;
}

export interface AmericanEndpoints {
  getToken: string;
  validateToken: string;
  auth: string;
  remoteAction: string;
  usageStats: string;
  health: string;
  messageCenter: string;
  myAccount: string;
  status: string;
  enrollmentStatus: string;
  subscriptions: string;
}
