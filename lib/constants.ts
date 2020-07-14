// moved all the US constants to its own file, we can use this file for shared constants
import { CA_ENDPOINTS } from './constants/canada';
import { EU_ENDPOINTS } from './constants/europe';

import { VehicleStatusOptions } from './interfaces/common.interfaces';

export const ALL_ENDPOINTS = {
  CA: CA_ENDPOINTS,
  EU: EU_ENDPOINTS,
};

export const GEN2 = 2;
export const GEN1 = 1;

export enum REGIONS {
  US = 'US',
  CA = 'CA',
  EU = 'EU',
}

export const DEFAULT_VEHICLE_STATUS_OPTIONS: VehicleStatusOptions = {
  refresh: false,
  parsed: false,
};
