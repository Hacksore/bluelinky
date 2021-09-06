import { Brand } from '../interfaces/common.interfaces';

export interface CanadianBrandEnvironment {
  brand: Brand;
  host: string;
  baseUrl: string;
  origin: 'SPA';
  endpoints: {
    login: string;
    logout: string;
    vehicleList:string;
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
  }
}

const getEndpoints = (baseUrl: string) => ({
  login: `${baseUrl}/tods/api/lgn`,
  logout: `${baseUrl}/tods/api/lgout`,
  // Vehicle
  vehicleList: `${baseUrl}/tods/api/vhcllst`,
  vehicleInfo: `${baseUrl}/tods/api/sltvhcl`,
  status: `${baseUrl}/tods/api/lstvhclsts`,
  remoteStatus: `${baseUrl}/tods/api/rltmvhclsts`,
  // Car commands with preauth (PIN)
  lock: `${baseUrl}/tods/api/drlck`,
  unlock: `${baseUrl}/tods/api/drulck`,
  start: `${baseUrl}/tods/api/evc/rfon`,
  stop: `${baseUrl}/tods/api/evc/rfoff`,
  startCharge: `${baseUrl}/tods/api/evc/rcstrt`,
  stopCharge: `${baseUrl}/tods/api/evc/rcstp`,
  setChargeTarget: `${baseUrl}/tods/api/evc/setsoc`,
  locate: `${baseUrl}/tods/api/fndmcr`,
  hornlight: `${baseUrl}/tods/api/hornlight`,
  // System
  verifyAccountToken: `${baseUrl}/tods/api/vrfyacctkn`,
  verifyPin: `${baseUrl}/tods/api/vrfypin`,
  verifyToken: `${baseUrl}/tods/api/vrfytnc`,
});

const getEnvironment = (host: string): Omit<CanadianBrandEnvironment, 'brand'> => {
  const baseUrl = `https://${host}`;
  return {
    host,
    baseUrl,
    origin: 'SPA',
    endpoints: Object.freeze(getEndpoints(baseUrl)),
  };
};

const getHyundaiEnvironment = (): CanadianBrandEnvironment => {
  return {
    brand: 'hyundai',
    ...getEnvironment('mybluelink.ca')
  };
};

const getKiaEnvironment = (): CanadianBrandEnvironment => {
  return {
    brand: 'hyundai',
    ...getEnvironment('myuvo.ca')
  };
};

export const getBrandEnvironment = (brand: Brand): CanadianBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment());
    case 'kia':
      return Object.freeze(getKiaEnvironment());
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};
