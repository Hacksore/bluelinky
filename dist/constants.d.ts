import { CanadianBrandEnvironment } from './constants/canada';
import { EuropeanBrandEnvironment } from './constants/europe';
import { ChineseBrandEnvironment } from './constants/china';
import { AustraliaBrandEnvironment } from './constants/australia';
import { Brand, VehicleStatusOptions } from './interfaces/common.interfaces';
export declare const ALL_ENDPOINTS: {
    CA: (brand: Brand) => CanadianBrandEnvironment['endpoints'];
    EU: (brand: Brand) => EuropeanBrandEnvironment['endpoints'];
    CN: (brand: Brand) => ChineseBrandEnvironment['endpoints'];
    AU: (brand: Brand) => AustraliaBrandEnvironment['endpoints'];
};
export declare const GEN2 = 2;
export declare const GEN1 = 1;
export type REGION = 'US' | 'CA' | 'EU' | 'CN' | 'AU';
export declare enum REGIONS {
    US = "US",
    CA = "CA",
    EU = "EU",
    CN = "CN",
    AU = "AU"
}
export type ChargeTarget = 50 | 60 | 70 | 80 | 90 | 100;
export declare const POSSIBLE_CHARGE_LIMIT_VALUES: number[];
export declare const DEFAULT_VEHICLE_STATUS_OPTIONS: VehicleStatusOptions;
