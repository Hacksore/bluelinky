import { Brand } from '../interfaces/common.interfaces';
import hyundaiStamps from '../tools/european.hyundai.token.collection';
import kiaStamps from '../tools/european.kia.token.collection';

export type EULanguages = 'cs'|'da'|'nl'|'en'|'fi'|'fr'|'de'|'it'|'pl'|'hu'|'no'|'sk'|'es'|'sv';
export const EU_LANGUAGES: EULanguages[] = ['cs', 'da', 'nl', 'en', 'fi', 'fr', 'de', 'it', 'pl', 'hu', 'no', 'sk', 'es', 'sv'];
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
  },
  basicToken: string;
  GCMSenderID: string;
  stamp: () => string;
  brandAuthUrl: (options: { language: EULanguages; serviceId: string; userId: string; }) => string;
}

const getEndpoints = (baseUrl: string, clientId: string): EuropeanBrandEnvironment['endpoints'] => ({
  session: `${baseUrl}/api/v1/user/oauth2/authorize?response_type=code&state=test&client_id=${clientId}&redirect_uri=${baseUrl}/api/v1/user/oauth2/redirect`,
  login: `${baseUrl}/api/v1/user/signin`,
  language: `${baseUrl}/api/v1/user/language`,
  redirectUri: `${baseUrl}/api/v1/user/oauth2/redirect`,
  token: `${baseUrl}/api/v1/user/oauth2/token`,
  integration: `${baseUrl}/api/v1/user/integrationinfo`,
  silentSignIn: `${baseUrl}/api/v1/user/silentsignin`,
});

const getHyundaiEnvironment = (): EuropeanBrandEnvironment => {
  const host = 'prd.eu-ccapi.hyundai.com:8080';
  const baseUrl = `https://${host}`;
  const clientId = '6d477c38-3ca4-4cf3-9557-2a1929a94654';
  return {
    brand: 'hyundai',
    host,
    baseUrl,
    clientId,
    appId: '99cfff84-f4e2-4be8-a5ed-e5b755eb6581',
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken: 'Basic NmQ0NzdjMzgtM2NhNC00Y2YzLTk1NTctMmExOTI5YTk0NjU0OktVeTQ5WHhQekxwTHVvSzB4aEJDNzdXNlZYaG10UVI5aVFobUlGampvWTRJcHhzVg==',
    GCMSenderID: '199360397125',
    stamp: () => hyundaiStamps[Math.floor(Math.random() * hyundaiStamps.length)],
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = '97516a3c-2060-48b4-98cd-8e7dcd3c47b2';
      return `https://eu-account.hyundai.com/auth/realms/euhyundaiidm/protocol/openid-connect/auth?client_id=${newAuthClientId}&scope=openid%20profile%20email%20phone&response_type=code&hkid_session_reset=true&redirect_uri=${baseUrl}/api/v1/user/integration/redirect/login&ui_locales=${language}&state=${serviceId}:${userId}`;
    }
  };
};

const getKiaEnvironment = (): EuropeanBrandEnvironment => {
  const host = 'prd.eu-ccapi.kia.com:8080';
  const baseUrl = `https://${host}`;
  const clientId = 'fdc85c00-0a2f-4c64-bcb4-2cfb1500730a';
  return {
    brand: 'kia',
    host,
    baseUrl,
    clientId,
    appId: '693a33fa-c117-43f2-ae3b-61a02d24f417',
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken: 'Basic ZmRjODVjMDAtMGEyZi00YzY0LWJjYjQtMmNmYjE1MDA3MzBhOnNlY3JldA==',
    GCMSenderID: '199360397125',
    stamp: () => kiaStamps[Math.floor(Math.random() * kiaStamps.length)],
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = 'f4d531c7-1043-444d-b09a-ad24bd913dd4';
      return `https://eu-account.kia.com/auth/realms/eukiaidm/protocol/openid-connect/auth?client_id=${newAuthClientId}&scope=openid%20profile%20email%20phone&response_type=code&hkid_session_reset=true&redirect_uri=${baseUrl}/api/v1/user/integration/redirect/login&ui_locales=${language}&state=${serviceId}:${userId}`;
    }
  };
};

export const getBrandEnvironment = (brand: Brand): EuropeanBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment());
    case 'kia':
      return Object.freeze(getKiaEnvironment());
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};