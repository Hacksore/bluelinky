import { EuropeBlueLinkyConfig } from '../controllers/european.controller';
import { Brand } from '../interfaces/common.interfaces';
export declare type EULanguages = 'cs' | 'da' | 'nl' | 'en' | 'fi' | 'fr' | 'de' | 'it' | 'pl' | 'hu' | 'no' | 'sk' | 'es' | 'sv';
export declare const EU_LANGUAGES: EULanguages[];
export declare const DEFAULT_LANGUAGE: EULanguages;
export interface EuropeanBrandEnvironment {
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
    stamp: () => Promise<string>;
    brandAuthUrl: (options: {
        language: EULanguages;
        serviceId: string;
        userId: string;
    }) => string;
}
declare type EnvironmentConfig = Required<Pick<EuropeBlueLinkyConfig, 'stampMode'>> & Partial<Pick<EuropeBlueLinkyConfig, 'stampsFile'>>;
declare type BrandEnvironmentConfig = Pick<EuropeBlueLinkyConfig, 'brand'> & Partial<EnvironmentConfig>;
export declare const getBrandEnvironment: ({ brand, stampMode, stampsFile, }: BrandEnvironmentConfig) => EuropeanBrandEnvironment;
export {};
