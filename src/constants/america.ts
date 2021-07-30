import { Brand } from '../interfaces/common.interfaces';

export interface AmericaBrandEnvironment {
  brand: Brand;
  host: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

const getHyundaiEnvironment = (): AmericaBrandEnvironment => {
  const host = 'api.telematics.hyundaiusa.com';
  const baseUrl = `https://${host}`;
  return {
    brand: 'hyundai',
    host,
    baseUrl,
    clientId: 'm66129Bb-em93-SPAHYN-bZ91-am4540zp19920',
    clientSecret: 'v558o935-6nne-423i-baa8',
  };
};

export const getBrandEnvironment = (brand: Brand): AmericaBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment());
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};
