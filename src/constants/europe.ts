import { Brand } from '../interfaces/common.interfaces';
import { readFile } from 'fs';
import { promisify } from 'util';
import got from 'got';

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
  stamp: (stampsFile?: string) => Promise<string>;
  brandAuthUrl: (options: { language: EULanguages; serviceId: string; userId: string; }) => string;
}
const cacheResult = <T>(fn: (...options: any[]) => Promise<T>, durationInMS = 60000): (...options: any[]) => Promise<T> => {
  let cache: Promise<T> | null = null;
  let age: number | null = null;
  return (...options: any[]) => {
    if(cache && age && (age + durationInMS) > Date.now()) {
      return cache;
    }
    cache = fn(...options).catch(e => { cache = null; return Promise.reject(e); });
    age = Date.now();
    return cache;
  };
};

const ONE_DAY_IN_MS = 60000 * 60 * 24;

const getStampList = async (file: string, stampsFile = `https://raw.githubusercontent.com/neoPix/bluelinky-stamps/master/${file}.json`): Promise<string[]> => {
  if (stampsFile.startsWith(('file://'))) {
    const [,path] = stampsFile.split('file://');
    const content = await promisify(readFile)(path);
    return JSON.parse(content.toString('utf-8'));
  }
  const { body } = await got(stampsFile, { json: true });
  return body;
};

const getStamp = (brand: string, stampsTimeout: number = ONE_DAY_IN_MS) => cacheResult(async (stampsFile?: string) => {
  const list = await getStampList(brand, stampsFile);
  return list[Math.floor(Math.random() * list.length)];
}, stampsTimeout);


const getEndpoints = (baseUrl: string, clientId: string): EuropeanBrandEnvironment['endpoints'] => ({
  session: `${baseUrl}/api/v1/user/oauth2/authorize?response_type=code&state=test&client_id=${clientId}&redirect_uri=${baseUrl}/api/v1/user/oauth2/redirect`,
  login: `${baseUrl}/api/v1/user/signin`,
  language: `${baseUrl}/api/v1/user/language`,
  redirectUri: `${baseUrl}/api/v1/user/oauth2/redirect`,
  token: `${baseUrl}/api/v1/user/oauth2/token`,
  integration: `${baseUrl}/api/v1/user/integrationinfo`,
  silentSignIn: `${baseUrl}/api/v1/user/silentsignin`,
});

const getHyundaiEnvironment = (stampsTimeout?: number): EuropeanBrandEnvironment => {
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
    stamp: getStamp(`hyundai-${appId}`, stampsTimeout),
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = '97516a3c-2060-48b4-98cd-8e7dcd3c47b2';
      return `https://eu-account.hyundai.com/auth/realms/euhyundaiidm/protocol/openid-connect/auth?client_id=${newAuthClientId}&scope=openid%20profile%20email%20phone&response_type=code&hkid_session_reset=true&redirect_uri=${baseUrl}/api/v1/user/integration/redirect/login&ui_locales=${language}&state=${serviceId}:${userId}`;
    }
  };
};

const getKiaEnvironment = (stampsTimeout?: number): EuropeanBrandEnvironment => {
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
    stamp: getStamp(`kia-${appId}`, stampsTimeout),
    brandAuthUrl({ language, serviceId, userId }) {
      const newAuthClientId = '572e0304-5f8d-4b4c-9dd5-41aa84eed160';
      return `https://eu-account.kia.com/auth/realms/eukiaidm/protocol/openid-connect/auth?client_id=${newAuthClientId}&scope=openid%20profile%20email%20phone&response_type=code&hkid_session_reset=true&redirect_uri=${baseUrl}/api/v1/user/integration/redirect/login&ui_locales=${language}&state=${serviceId}:${userId}`;
    }
  };
};

export const getBrandEnvironment = (brand: Brand, stampsTimeout?: number): EuropeanBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment(stampsTimeout));
    case 'kia':
      return Object.freeze(getKiaEnvironment(stampsTimeout));
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};