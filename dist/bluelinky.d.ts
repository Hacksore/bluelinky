/// <reference types="node" />
import EventEmitter from 'events';
interface AuthConfig {
    username: string | null;
    password: string | null;
}
interface StartConfig {
    airCtrl?: boolean | string;
    igniOnDuration: number;
    airTempvalue?: number;
    defrost?: boolean | string;
    heating1?: boolean | string;
}
interface HyundaiResponse {
    status: string;
    result: any;
    errorMessage: string;
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
    token: string | null;
    bluelinky: BlueLinky;
}
declare class Vehicle {
    private _vin;
    private _pin;
    private _eventEmitter;
    private _bluelinky;
    private _currentFeatures;
    constructor(config: VehicleConfig);
    addFeature(featureName: any, state: any): void;
    onInit(): Promise<void>;
    readonly vin: string | null;
    readonly eventEmitter: EventEmitter;
    hasFeature(featureName: string): boolean;
    getFeatures(): object;
    unlock(): Promise<HyundaiResponse | null>;
    lock(): Promise<HyundaiResponse | null>;
    start(config: StartConfig): Promise<HyundaiResponse | null>;
    stop(): Promise<HyundaiResponse | null>;
    flashLights(): Promise<HyundaiResponse | null>;
    panic(): Promise<HyundaiResponse | null>;
    health(): Promise<HyundaiResponse | null>;
    apiUsageStatus(): Promise<HyundaiResponse | null>;
    messages(): Promise<HyundaiResponse | null>;
    accountInfo(): Promise<HyundaiResponse | null>;
    features(): Promise<HyundaiResponse | null>;
    serviceInfo(): Promise<HyundaiResponse | null>;
    pinStatus(): Promise<HyundaiResponse | null>;
    subscriptionStatus(): Promise<HyundaiResponse | null>;
    status(refresh?: boolean): Promise<HyundaiResponse | null>;
    _request(endpoint: any, data: any): Promise<any | null>;
}
declare class BlueLinky {
    private authConfig;
    private _accessToken;
    private _tokenExpires;
    private _vehicles;
    constructor(authConfig: AuthConfig);
    login(): Promise<void>;
    accessToken: string | null;
    tokenExpires: number;
    readonly username: string | null;
    getVehicles(): Vehicle[];
    getVehicle(vin: string): Vehicle | undefined;
    registerVehicle(vin: string, pin: string): Promise<Vehicle | null>;
    handleTokenRefresh(): Promise<void>;
    getToken(): Promise<TokenResponse>;
}
export default BlueLinky;
