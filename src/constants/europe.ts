import { Brand } from '../interfaces/common.interfaces';
import { readFile } from 'fs';
import { promisify } from 'util';
import got from 'got';

export type EULanguages = 'cs'|'da'|'nl'|'en'|'fi'|'fr'|'de'|'it'|'pl'|'hu'|'no'|'sk'|'es'|'sv';
export const EU_LANGUAGES: EULanguages[] = ['cs', 'da', 'nl', 'en', 'fi', 'fr', 'de', 'it', 'pl', 'hu', 'no', 'sk', 'es', 'sv'];
export const DEFAULT_LANGUAGE: EULanguages = 'en';

interface StampCollection {
  stamps: string[];
  generated: string;
  frequency: number;
}

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
  stamp: (stampsFile?: string) => Promise<string>;
  brandAuthUrl: (options: { language: EULanguages; serviceId: string; userId: string; }) => string;
}

const cachedStamps = new Map<string, StampCollection>();

const getAndCacheStamps = async (file: string, stampsFile = `https://raw.githubusercontent.com/neoPix/bluelinky-stamps/master/${file}.v2.json`): Promise<StampCollection> => {
  if (stampsFile.startsWith(('file://'))) {
    const [,path] = stampsFile.split('file://');
    const content = await promisify(readFile)(path);
    return JSON.parse(content.toString('utf-8'));
  }
  const { body } = await got(stampsFile, { json: true });
  cachedStamps.set(file, body as StampCollection);
  return body as StampCollection;
};


const getStamp = (stampFileKey: string) => async (stampsFile?: string) => {
  const { stamps, generated, frequency } = cachedStamps.get(stampFileKey) ?? await getAndCacheStamps(stampFileKey, stampsFile);
  const generatedDate = new Date(generated);
  const millisecondsSinceStampsGeneration = Date.now() - generatedDate.getTime();
  const position = Math.floor(millisecondsSinceStampsGeneration / frequency);
  if (position / (stamps.length - 1) >= .9) {
    cachedStamps.delete(stampFileKey);
  }
  return stamps[Math.min(position, stamps.length - 1)];
};


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
  const appId = '014d2225-8495-4735-812d-2616334fd15d';
  return {
    brand: 'hyundai',
    host,
    baseUrl,
    clientId,
    appId,
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken: 'Basic NmQ0NzdjMzgtM2NhNC00Y2YzLTk1NTctMmExOTI5YTk0NjU0OktVeTQ5WHhQekxwTHVvSzB4aEJDNzdXNlZYaG10UVI5aVFobUlGampvWTRJcHhzVg==',
    GCMSenderID: '414998006775',
    stamp: getStamp(`hyundai-${appId}`),
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = '64621b96-0f0d-11ec-82a8-0242ac130003';
      return `https://eu-account.hyundai.com/auth/realms/euhyundaiidm/protocol/openid-connect/auth?client_id=${newAuthClientId}&scope=openid%20profile%20email%20phone&response_type=code&hkid_session_reset=true&redirect_uri=${baseUrl}/api/v1/user/integration/redirect/login&ui_locales=${language}&state=${serviceId}:${userId}`;
    }
  };
};

const getKiaEnvironment = (): EuropeanBrandEnvironment => {
  const host = 'prd.eu-ccapi.kia.com:8080';
  const baseUrl = `https://${host}`;
  const clientId = 'fdc85c00-0a2f-4c64-bcb4-2cfb1500730a';
  const appId = 'e7bcd186-a5fd-410d-92cb-6876a42288bd';
  return {
    brand: 'kia',
    host,
    baseUrl,
    clientId,
    appId,
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken: 'Basic ZmRjODVjMDAtMGEyZi00YzY0LWJjYjQtMmNmYjE1MDA3MzBhOnNlY3JldA==',
    GCMSenderID: '345127537656',
    stamp: getStamp(`kia-${appId}`),
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = '572e0304-5f8d-4b4c-9dd5-41aa84eed160';
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
