import { EuropeBlueLinkyConfig, StampMode } from '../controllers/european.controller';
import { Brand } from '../interfaces/common.interfaces';
import { getStampGenerator } from './europe.stamps';

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
  brandAuthUrl: (options: { language: EULanguages; serviceId: string; userId: string }) => string;
}

const getEndpoints = (
  baseUrl: string,
  clientId: string
): EuropeanBrandEnvironment['endpoints'] => ({
  session: `${baseUrl}/api/v1/user/oauth2/authorize?response_type=code&state=test&client_id=${clientId}&redirect_uri=${baseUrl}/api/v1/user/oauth2/redirect`,
  login: `${baseUrl}/api/v1/user/signin`,
  language: `${baseUrl}/api/v1/user/language`,
  redirectUri: `${baseUrl}/api/v1/user/oauth2/redirect`,
  token: `${baseUrl}/api/v1/user/oauth2/token`,
  integration: `${baseUrl}/api/v1/user/integrationinfo`,
  silentSignIn: `${baseUrl}/api/v1/user/silentsignin`,
});

type EnvironmentConfig = Required<Pick<EuropeBlueLinkyConfig, 'stampMode'>> &
  Partial<Pick<EuropeBlueLinkyConfig, 'stampsFile'>>;
type BrandEnvironmentConfig = Pick<EuropeBlueLinkyConfig, 'brand'> & Partial<EnvironmentConfig>;

const getHyundaiEnvironment = ({
  stampMode,
  stampsFile,
}: EnvironmentConfig): EuropeanBrandEnvironment => {
  const host = 'prd.eu-ccapi.hyundai.com:8080';
  const baseUrl = `https://${host}`;
  const clientId = '6d477c38-3ca4-4cf3-9557-2a1929a94654';
  const appId = '1eba27d2-9a5b-4eba-8ec7-97eb6c62fb51';
  return {
    brand: 'hyundai',
    host,
    baseUrl,
    clientId,
    appId,
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken:
      'Basic NmQ0NzdjMzgtM2NhNC00Y2YzLTk1NTctMmExOTI5YTk0NjU0OktVeTQ5WHhQekxwTHVvSzB4aEJDNzdXNlZYaG10UVI5aVFobUlGampvWTRJcHhzVg==',
    GCMSenderID: '414998006775',
    stamp: getStampGenerator({ appId, brand: 'hyundai', mode: stampMode, stampsFile: stampsFile }),
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = '64621b96-0f0d-11ec-82a8-0242ac130003';
      return `https://eu-account.hyundai.com/auth/realms/euhyundaiidm/protocol/openid-connect/auth?client_id=${newAuthClientId}&scope=openid%20profile%20email%20phone&response_type=code&hkid_session_reset=true&redirect_uri=${baseUrl}/api/v1/user/integration/redirect/login&ui_locales=${language}&state=${serviceId}:${userId}`;
    },
  };
};

const getKiaEnvironment = ({
  stampMode,
  stampsFile,
}: EnvironmentConfig): EuropeanBrandEnvironment => {
  const host = 'prd.eu-ccapi.kia.com:8080';
  const baseUrl = `https://${host}`;
  const clientId = 'fdc85c00-0a2f-4c64-bcb4-2cfb1500730a';
  const appId = 'a2b8469b-30a3-4361-8e13-6fceea8fbe74';
  return {
    brand: 'kia',
    host,
    baseUrl,
    clientId,
    appId,
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken: 'Basic ZmRjODVjMDAtMGEyZi00YzY0LWJjYjQtMmNmYjE1MDA3MzBhOnNlY3JldA==',
    GCMSenderID: '345127537656',
    stamp: getStampGenerator({ appId, brand: 'kia', mode: stampMode, stampsFile: stampsFile }),
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = '572e0304-5f8d-4b4c-9dd5-41aa84eed160';
      return `https://eu-account.kia.com/auth/realms/eukiaidm/protocol/openid-connect/auth?client_id=${newAuthClientId}&scope=openid%20profile%20email%20phone&response_type=code&hkid_session_reset=true&redirect_uri=${baseUrl}/api/v1/user/integration/redirect/login&ui_locales=${language}&state=${serviceId}:${userId}`;
    },
  };
};

export const getBrandEnvironment = ({
  brand,
  stampMode = StampMode.DISTANT,
  stampsFile,
}: BrandEnvironmentConfig): EuropeanBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment({ stampMode, stampsFile }));
    case 'kia':
      return Object.freeze(getKiaEnvironment({ stampMode, stampsFile }));
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};
