interface AuthConfig {
    vin: string | null;
    username: string | null;
    password: string | null;
    pin: string | null;
}
interface StartConfig {
    airCtrl: boolean;
    igniOnDuration: number;
    airTempvalue: number;
    defrost: boolean;
    heating1: boolean;
}
interface HyundaiResponse {
    E_IFRESULT: string;
    E_IFFAILMSG: string;
    RESPONSE_STRING: JSON;
}
declare class BlueLinky {
    private authConfig;
    private token;
    constructor(authConfig: AuthConfig);
    setAuthConfig(config: AuthConfig): void;
    getToken(): Promise<String>;
    unlockVehicle(): Promise<HyundaiResponse>;
    lockVehicle(): Promise<HyundaiResponse>;
    startVehicle(config: StartConfig): Promise<HyundaiResponse>;
    stopVehicle(): Promise<HyundaiResponse>;
    flashVehicleLights(): Promise<HyundaiResponse>;
    vehiclePanic(): Promise<HyundaiResponse>;
    vehicleHealth(): Promise<HyundaiResponse>;
    apiUsageStatus(): Promise<HyundaiResponse>;
    _request(endpoint: any, data: any): Promise<HyundaiResponse>;
}
export = BlueLinky;
