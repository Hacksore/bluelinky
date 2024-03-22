// moved all the US constants to its own file, we can use this file for shared constants
import {
  getBrandEnvironment as getCABrandEnvironment,
  CanadianBrandEnvironment,
} from './constants/canada';
import {
  getBrandEnvironment as getEUBrandEnvironment,
  EuropeanBrandEnvironment,
} from './constants/europe';
import {
  getBrandEnvironment as getCNBrandEnvironment,
  ChineseBrandEnvironment,
} from './constants/china';
import {
  getBrandEnvironment as getAUBrandEnvironment,
  AustraliaBrandEnvironment,
} from './constants/australia';

import { Brand, VehicleStatusOptions } from './interfaces/common.interfaces';

export const ALL_ENDPOINTS = {
  CA: (brand: Brand): CanadianBrandEnvironment['endpoints'] =>
    getCABrandEnvironment(brand).endpoints,
  EU: (brand: Brand): EuropeanBrandEnvironment['endpoints'] =>
    getEUBrandEnvironment({ brand }).endpoints,
  CN: (brand: Brand): ChineseBrandEnvironment['endpoints'] =>
    getCNBrandEnvironment({ brand }).endpoints,
  AU: (brand: Brand): AustraliaBrandEnvironment['endpoints'] =>
    getAUBrandEnvironment({ brand }).endpoints,
};

export const GEN2 = 2;
export const GEN1 = 1;
export type REGION = 'US' | 'CA' | 'EU' | 'CN' | 'AU';
export enum REGIONS {
  US = 'US',
  CA = 'CA',
  EU = 'EU',
  CN = 'CN',
  AU = 'AU',
}

// ev stuffz
export type ChargeTarget = 50 | 60 | 70 | 80 | 90 | 100;
export const POSSIBLE_CHARGE_LIMIT_VALUES = [50, 60, 70, 80, 90, 100];

export const DEFAULT_VEHICLE_STATUS_OPTIONS: VehicleStatusOptions = {
  refresh: false,
  parsed: false,
};
