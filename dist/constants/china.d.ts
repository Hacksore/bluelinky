import { ChineseBlueLinkConfig } from '../controllers/chinese.controller';
import { Brand } from '../interfaces/common.interfaces';
export interface ChineseBrandEnvironment {
    brand: Brand;
    host: string;
    baseUrl: string;
    clientId: string;
    appId: string;
    endpoints: {
        integration: string;
        silentSignIn: string;
        session: string;
        login: string;
        language: string;
        redirectUri: string;
        token: string;
    };
    basicToken: string;
    GCMSenderID: string;
    providerDeviceId: string;
    pushRegId: string;
}
declare type BrandEnvironmentConfig = Pick<ChineseBlueLinkConfig, 'brand'>;
export declare const getBrandEnvironment: ({ brand, }: BrandEnvironmentConfig) => ChineseBrandEnvironment;
export {};
