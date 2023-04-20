import { ChineseBlueLinkConfig } from '../controllers/chinese.controller';
import { Brand } from '../interfaces/common.interfaces';

export interface ChineseBrandEnvironment {
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
  providerDeviceId: string;
  pushRegId: string;
}

const getEndpoints = (
  baseUrl: string,
  clientId: string
): ChineseBrandEnvironment['endpoints'] => ({
  session: `${baseUrl}/api/v1/user/oauth2/authorize?response_type=code&state=test&client_id=${clientId}&redirect_uri=${baseUrl}:443/api/v1/user/oauth2/redirect`,
  login: `${baseUrl}/api/v1/user/signin`,
  language: `${baseUrl}/api/v1/user/language`,
  redirectUri: `${baseUrl}:443/api/v1/user/oauth2/redirect`,
  token: `${baseUrl}/api/v1/user/oauth2/token`,
  integration: `${baseUrl}/api/v1/user/integrationinfo`,
  silentSignIn: `${baseUrl}/api/v1/user/silentsignin`,
});

type BrandEnvironmentConfig = Pick<ChineseBlueLinkConfig, 'brand'>;

const getHyundaiEnvironment = (): ChineseBrandEnvironment => {
  const host = 'prd.cn-ccapi.hyundai.com';
  const baseUrl = `https://${host}`;
  const clientId = '72b3d019-5bc7-443d-a437-08f307cf06e2';
  const appId = 'ed01581a-380f-48cd-83d4-ed1490c272d0';
  return {
    brand: 'hyundai',
    host,
    baseUrl,
    clientId,
    appId,
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken:
      'Basic NzJiM2QwMTktNWJjNy00NDNkLWE0MzctMDhmMzA3Y2YwNmUyOnNlY3JldA==',
    GCMSenderID: '414998006775',
    providerDeviceId: '59af09e554a9442ab8589c9500d04d2e',
    pushRegId: '1',
  };
};

const getKiaEnvironment = (): ChineseBrandEnvironment => {
  const host = 'prd.cn-ccapi.kia.com';
  const baseUrl = `https://${host}`;
  const clientId = '9d5df92a-06ae-435f-b459-8304f2efcc67';
  const appId = 'eea8762c-adfc-4ee4-8d7a-6e2452ddf342';
  return {
    brand: 'kia',
    host,
    baseUrl,
    clientId,
    appId,
    endpoints: Object.freeze(getEndpoints(baseUrl, clientId)),
    basicToken: 'Basic OWQ1ZGY5MmEtMDZhZS00MzVmLWI0NTktODMwNGYyZWZjYzY3OnRzWGRrVWcwOEF2MlpaelhPZ1d6Snl4VVQ2eWVTbk5OUWtYWFBSZEtXRUFOd2wxcA==',
    GCMSenderID: '345127537656',
    providerDeviceId: '32dedba78045415b92db816e805ed47b',
    pushRegId: 'ogc+GB5gom7zDEQjPhb3lP+bjjM=DG2rQ9Zuq0otwOU7n9y08LKjYpo=',
  };
};

export const getBrandEnvironment = ({
  brand,
}: BrandEnvironmentConfig): ChineseBrandEnvironment => {
  switch (brand) {
    case 'hyundai':
      return Object.freeze(getHyundaiEnvironment());
    case 'kia':
      return Object.freeze(getKiaEnvironment());
    default:
      throw new Error(`Constructor ${brand} is not managed.`);
  }
};
