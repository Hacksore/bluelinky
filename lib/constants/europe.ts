
export const EU_API_HOST = 'prd.eu-ccapi.hyundai.com:8080';
export const EU_BASE_URL = `https://${EU_API_HOST}`;

export const EU_CLIENT_ID = '6d477c38-3ca4-4cf3-9557-2a1929a94654';

export const EU_ENDPOINTS = {
  session: `${EU_BASE_URL}/api/v1/user/oauth2/authorize?response_type=code&state=test&client_id=${EU_CLIENT_ID}&redirect_uri=${EU_BASE_URL}/api/v1/user/oauth2/redirect`,
  login: `${EU_BASE_URL}/api/v1/user/signin`,
  language: `${EU_BASE_URL}/api/v1/user/language`,
  redirectUri: `${EU_BASE_URL}/api/v1/user/oauth2/redirect`,
  token: `${EU_BASE_URL}/api/v1/user/oauth2/token`,
};

export const EU_CONSTANTS = {
  basicToken:
    'Basic NmQ0NzdjMzgtM2NhNC00Y2YzLTk1NTctMmExOTI5YTk0NjU0OktVeTQ5WHhQekxwTHVvSzB4aEJDNzdXNlZYaG10UVI5aVFobUlGampvWTRJcHhzVg==',
  GCMSenderID: '199360397125',
};
