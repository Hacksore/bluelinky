import { Brand } from '../interfaces/common.interfaces';
export interface CanadianBrandEnvironment {
    brand: Brand;
    host: string;
    baseUrl: string;
    origin: 'SPA';
    endpoints: {
        login: string;
        logout: string;
        vehicleList: string;
        vehicleInfo: string;
        status: string;
        remoteStatus: string;
        lock: string;
        unlock: string;
        start: string;
        stop: string;
        locate: string;
        hornlight: string;
        verifyAccountToken: string;
        verifyPin: string;
        verifyToken: string;
        setChargeTarget: string;
        stopCharge: string;
        startCharge: string;
    };
}
export declare const getBrandEnvironment: (brand: Brand) => CanadianBrandEnvironment;
