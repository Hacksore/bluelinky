import { CanadianBrandEnvironment } from './constants/canada';
import { EuropeanBrandEnvironment } from './constants/europe';
import { ChineseBrandEnvironment } from './constants/china';
import { Brand, VehicleStatusOptions } from './interfaces/common.interfaces';
export declare const ALL_ENDPOINTS: {
    CA: (brand: Brand) => CanadianBrandEnvironment['endpoints'];
    EU: (brand: Brand) => EuropeanBrandEnvironment['endpoints'];
    CN: (brand: Brand) => ChineseBrandEnvironment['endpoints'];
};
export declare const GEN2 = 2;
export declare const GEN1 = 1;
export declare type REGION = 'US' | 'CA' | 'EU' | 'CN';
export declare enum REGIONS {
    US = "US",
    CA = "CA",
    EU = "EU",
    CN = "CN"
}
export declare type ChargeTarget = 50 | 60 | 70 | 80 | 90 | 100;
export declare const POSSIBLE_CHARGE_LIMIT_VALUES: number[];
export declare const DEFAULT_VEHICLE_STATUS_OPTIONS: VehicleStatusOptions;
