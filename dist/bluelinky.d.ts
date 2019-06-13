interface AuthConfig {
    vin: string | null;
    username: string | null;
    password: string | null;
    pin: string | null;
}
interface StartConfig {
    airCtrl: boolean | string;
    igniOnDuration: number;
    airTempvalue: number;
    defrost: boolean | string;
    heating1: boolean | string;
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
    getToken(): Promise<String>;
    unlockVehicle(): Promise<HyundaiResponse | null>;
    lockVehicle(): Promise<HyundaiResponse | null>;
    startVehicle(config: StartConfig): Promise<HyundaiResponse | null>;
    stopVehicle(): Promise<HyundaiResponse | null>;
    flashVehicleLights(): Promise<HyundaiResponse | null>;
    vehiclePanic(): Promise<HyundaiResponse | null>;
    vehicleHealth(): Promise<HyundaiResponse | null>;
    apiUsageStatus(): Promise<HyundaiResponse | null>;
    messages(): Promise<HyundaiResponse | null>;
    accountInfo(): Promise<HyundaiResponse | null>;
    enrollmentStatus(): Promise<HyundaiResponse | null>;
    serviceInfo(): Promise<HyundaiResponse | null>;
    pinStatus(): Promise<HyundaiResponse | null>;
    subscriptionStatus(): Promise<HyundaiResponse | null>;
    vehicleStatus(): Promise<HyundaiResponse | null>;
    _request(endpoint: any, data: any): Promise<HyundaiResponse | null>;
}
export = BlueLinky;
