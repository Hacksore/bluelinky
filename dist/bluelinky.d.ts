/// <reference types="node" />
import { EventEmitter } from 'events';
interface AuthConfig {
    username: string | null;
    password: string | null;
}
interface StartConfig {
    airCtrl: boolean | string;
    igniOnDuration: number;
    airTempvalue: number;
    defrost: boolean | string;
    heating1: boolean | string;
}
interface HyundaiResponse {
    status: string;
    result: any;
    errorMessage?: string | null;
    ENROLLMENT_DETAILS?: any;
    FEATURE_DETAILS?: any;
}
interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    username: string;
}
interface VehicleConfig {
    vin: string | null;
    pin: string | null;
    username: string | null;
    token: string | null;
    bluelinky: BlueLinky;
}
declare class Vehicle {
    vin: string | null;
    pin: string | null;
    username: string | null;
    token: string | null;
    eventEmitter: EventEmitter;
    bluelinky: BlueLinky;
    currentFeatures: {};
    constructor(config: VehicleConfig);
    onInit(): Promise<void>;
    hasFeature(featureName: string): boolean;
    unlock(): Promise<HyundaiResponse | null>;
    lock(): Promise<HyundaiResponse | null>;
    startVehicle(config: StartConfig): Promise<HyundaiResponse | null>;
    stopVehicle(): Promise<HyundaiResponse | null>;
    flashLights(): Promise<HyundaiResponse | null>;
    panic(): Promise<HyundaiResponse | null>;
    health(): Promise<HyundaiResponse | null>;
    apiUsageStatus(): Promise<HyundaiResponse | null>;
    messages(): Promise<HyundaiResponse | null>;
    accountInfo(): Promise<HyundaiResponse | null>;
    enrollmentStatus(): Promise<HyundaiResponse | null>;
    serviceInfo(): Promise<HyundaiResponse | null>;
    pinStatus(): Promise<HyundaiResponse | null>;
    subscriptionStatus(): Promise<HyundaiResponse | null>;
    status(): Promise<HyundaiResponse | null>;
    _request(endpoint: any, data: any): Promise<HyundaiResponse | null>;
}
export declare function login(authConfig: AuthConfig): Promise<BlueLinky>;
declare class BlueLinky {
    private authConfig;
    private _accessToken;
    private _tokenExpires;
    private _vehicles;
    constructor(authConfig: AuthConfig);
    accessToken: string | null;
    tokenExpires: number;
    getVehicles(): Vehicle[];
    getVehicle(vin: string): Vehicle | undefined;
    registerVehicle(vin: string, pin: string): Promise<Vehicle | null>;
    handleTokenRefresh(): Promise<void>;
    getToken(): Promise<TokenResponse>;
}
export {};
