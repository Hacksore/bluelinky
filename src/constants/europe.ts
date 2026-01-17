import { EuropeBlueLinkyConfig } from '../controllers/european.controller';
import { Brand } from '../interfaces/common.interfaces';
import * as base64 from 'base64-js';

export type EULanguages =
  | 'cs'
  | 'da'
  | 'nl'
  | 'en'
  | 'fi'
  | 'fr'
  | 'de'
  | 'it'
  | 'pl'
  | 'hu'
  | 'no'
  | 'sk'
  | 'es'
  | 'sv';
export const EU_LANGUAGES: EULanguages[] = [
  'cs',
  'da',
  'nl',
  'en',
  'fi',
  'fr',
  'de',
  'it',
  'pl',
  'hu',
  'no',
  'sk',
  'es',
  'sv',
];
export const DEFAULT_LANGUAGE: EULanguages = 'en';

export interface EuropeanBrandEnvironment {
  brand: Brand;
  host: string;
  baseUrl: string;

  ccspServiceID: string;
  ccspServiceSecret: string;
  ccspApplicationID: string;
  cfb: string;
  basicToken: string;
  pushType: string;
  loginFormHost: string;

  endpoints: {
    deviceIdURL: string;
    integrationInfoURL: string;
    silentSigninURL: string;
    languageURL: string;
    loginURL: string;
    tokenURL: string;
  };
  stamp: { result: string | null; error: Error | null };
}

const getEndpoints = (
  baseUrl: string
): EuropeanBrandEnvironment['endpoints'] => ({
  deviceIdURL:        `${baseUrl}/api/v1/spa/notifications/register`,
  integrationInfoURL: `${baseUrl}/api/v1/user/integrationinfo`,
  silentSigninURL:    `${baseUrl}/api/v1/user/silentsignin`,
  languageURL:        `${baseUrl}/api/v1/user/language`,
  loginURL:           `${baseUrl}/api/v1/user/signin`,
  tokenURL:           '/auth/api/v2/user/oauth2/token',
});

const getStamp = (cfb: string, ccspApplicationID: string): { result: string | null; error: Error | null } => {
  try {
      const cfb64 = base64.toByteArray(cfb);
      
      const timestamp = Math.floor(Date.now()).toString();
      const raw = ccspApplicationID + ':' + timestamp;
      const rawBytes = new TextEncoder().encode(raw);

      if (cfb64.length !== rawBytes.length) {
        return {
          result: null,
          error: new Error(`cfb and raw length not equal: ${cfb64.length} != ${rawBytes.length}`)
        };
      }

      const enc = new Uint8Array(cfb64.length);
      for (let i = 0; i < cfb64.length; i++) {
        enc[i] = cfb64[i] ^ rawBytes[i];
      }

      return {
        result: base64.fromByteArray(enc),
        error: null
      };
    } catch (err) {
      return {
        result: null,
        error: err as Error
      };
    }
};

type BrandEnvironmentConfig = Pick<EuropeBlueLinkyConfig, 'brand'>;

const getHyundaiEnvironment = (): EuropeanBrandEnvironment => {
  const host =              'prd.eu-ccapi.hyundai.com:8080';
  const baseUrl =           `https://${host}`;

  const ccspServiceID =     '6d477c38-3ca4-4cf3-9557-2a1929a94654';
  const ccspServiceSecret = 'KUy49XxPzLpLuoK0xhBC77W6VXhmtQR9iQhmIFjjoY4IpxsV';
  const ccspApplicationID = '014d2225-8495-4735-812d-2616334fd15d';
  const cfb =               'RFtoRq/vDXJmRndoZaZQyfOot7OrIqGVFj96iY2WL3yyH5Z/pUvlUhqmCxD2t+D65SQ=';
  const basicToken =        'NmQ0NzdjMzgtM2NhNC00Y2YzLTk1NTctMmExOTI5YTk0NjU0OktVeTQ5WHhQekxwTHVvSzB4aEJDNzdXNlZYaG10UVI5aVFobUlGampvWTRJcHhzVg==';
  const pushType =          'GCM';
  const loginFormHost =     'https://idpconnect-eu.hyundai.com';

  return {
    brand: 'hyundai',
    host,
    baseUrl,
    ccspServiceID,
    ccspServiceSecret,
    ccspApplicationID,
    cfb,
    basicToken,
    pushType,
    loginFormHost,
    endpoints: Object.freeze(getEndpoints(baseUrl)),
    stamp: getStamp(cfb, ccspApplicationID),
  };
};

const getKiaEnvironment = (): EuropeanBrandEnvironment => {
  const host = 'prd.eu-ccapi.kia.com:8080';
  const baseUrl = `https://${host}`;

  const ccspServiceID =     'fdc85c00-0a2f-4c64-bcb4-2cfb1500730a';
  const ccspServiceSecret = 'secret';
  const ccspApplicationID = 'a2b8469b-30a3-4361-8e13-6fceea8fbe74';
  const cfb =               'wLTVxwidmH8CfJYBWSnHD6E0huk0ozdiuygB4hLkM5XCgzAL1Dk5sE36d/bx5PFMbZs=';
  const basicToken =        'ZmRjODVjMDAtMGEyZi00YzY0LWJjYjQtMmNmYjE1MDA3MzBhOnNlY3JldA==';
  const pushType =          'APNS';
  const loginFormHost =     'https://idpconnect-eu.kia.com';

  return {
    brand: 'kia',
    host,
    baseUrl,
    ccspServiceID,
    ccspServiceSecret,
    ccspApplicationID,
    cfb,
    basicToken,
    pushType,
    loginFormHost,
    endpoints: Object.freeze(getEndpoints(baseUrl)),
    stamp: getStamp(cfb, ccspApplicationID),
  };
};

export const getBrandEnvironment = ({
  brand,
}: BrandEnvironmentConfig): EuropeanBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment());
    case 'kia':
      return Object.freeze(getKiaEnvironment());
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};
