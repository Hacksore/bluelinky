import { Brand } from '../interfaces/common.interfaces';

export interface BrazilBrandEnvironment {
  brand: Brand;
  host: string;
  baseUrl: string;
  clientId: string;
  appId: string;
  endpoints: {
    session: string;
    login: string;
    language: string;
    redirectUri: string;
    token: string;
    integration: string;
    silentSignIn: string;
  };
  basicToken: string;
}

const getEndpoints = (baseUrl: string, clientId: string): BrazilBrandEnvironment['endpoints'] => ({
  session: `${baseUrl}/api/v1/user/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    `${baseUrl}/api/v1/user/oauth2/redirect`
  )}&lang=pt`,
  login: `${baseUrl}/api/v1/user/signin`,
  language: `${baseUrl}/api/v1/user/language`,
  redirectUri: `${baseUrl}/api/v1/user/oauth2/redirect`,
  token: `${baseUrl}/api/v1/user/oauth2/token`,
  integration: `${baseUrl}/api/v1/user/integrationinfo`,
  silentSignIn: `${baseUrl}/api/v1/user/silentsignin`,
});

const getHyundaiEnvironment = (): BrazilBrandEnvironment => {
  const host = 'br-ccapi.hyundai.com.br';
  const baseUrl = `https://${host}`;
  const clientId = '03f7df9b-7626-4853-b7bd-ad1e8d722bd5';
  const appId = '513a491a-0d7c-4d6a-ac03-a2df127d73b0';
  return {
    brand: 'hyundai',
    host,
    baseUrl,
    clientId,
    appId,
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken:
      'Basic MDNmN2RmOWItNzYyNi00ODUzLWI3YmQtYWQxZThkNzIyYmQ1OnlRejJiYzZDbjhPb3ZWT1I3UkRXd3hUcVZ3V0czeUtCWUZEZzBIc09Yc3l4eVBsSA==',
  };
};

const getKiaEnvironment = (): BrazilBrandEnvironment => {
  throw new Error('Kia is currently not supported in the Brazil region.');
};

export const getBrandEnvironment = (brand: Brand): BrazilBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment());
    case 'kia':
      return Object.freeze(getKiaEnvironment());
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};
