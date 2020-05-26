import BlueLinky from '../index';

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
  vin: string | null;
  pin: string | null;
  token: string | null;
  bluelinky: BlueLinky;
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

export interface RequestHeaders {
  'access_token': string|undefined;
  'client_id': string;
  'Host': string;
  'User-Agent': string;
  'registrationId': string;
  'gen': string;
  'username': string|undefined;
  'vin': string;
  'APPCLOUD-VIN': string;
  'Language': string;
  'to': string;
  'encryptFlag': string;
  'from': string;
  'brandIndicator': string;
  'bluelinkservicepin': string|undefined;
  'offset': string;
}
