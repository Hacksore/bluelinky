import BlueLinky from './index';
export interface AuthConfig {
    username: string | null;
    password: string | null;
}
export interface StartConfig {
    airCtrl?: boolean | string;
    igniOnDuration: number;
    airTempvalue?: number;
    defrost?: boolean | string;
    heating1?: boolean | string;
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
    vin: string | null;
    pin: string | null;
    token: string | null;
    bluelinky: BlueLinky;
}
