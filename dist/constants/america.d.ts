import { Brand } from '../interfaces/common.interfaces';
export interface AmericaBrandEnvironment {
    brand: Brand;
    host: string;
    baseUrl: string;
    clientId: string;
    clientSecret: string;
}
export declare const getBrandEnvironment: (brand: Brand) => AmericaBrandEnvironment;
