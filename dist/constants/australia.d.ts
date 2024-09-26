import { AustraliaBlueLinkyConfig } from '../controllers/australia.controller';
import { Brand } from '../interfaces/common.interfaces';
import { StampMode } from './stamps';
export interface AustraliaBrandEnvironment {
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
    stamp: () => Promise<string>;
}
type EnvironmentConfig = {
    stampMode: StampMode;
    stampsFile?: string;
};
type BrandEnvironmentConfig = Pick<AustraliaBlueLinkyConfig, 'brand'> & Partial<EnvironmentConfig>;
export declare const getBrandEnvironment: ({ brand, stampMode, stampsFile, }: BrandEnvironmentConfig) => AustraliaBrandEnvironment;
export {};
