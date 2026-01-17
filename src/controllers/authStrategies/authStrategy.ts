import { CookieJar } from 'tough-cookie';
import { EuropeanBrandEnvironment } from '../../constants/europe';

export type Code = string;
export type Token = {
  refresh_token: string;
  access_token: string;
  expires_in: number;
};

export interface AuthStrategy {
  readonly name: string;
  login(
    user: { username: string; password: string },
    options?: { cookieJar?: CookieJar }
  ): Promise<{ code: Code | Token; cookies: CookieJar }>;
}

export async function initSession(
  environment: EuropeanBrandEnvironment,
  cookies?: CookieJar
): Promise<CookieJar> {
  const cookieJar = cookies ?? new CookieJar();
  //!!!// await got(environment.endpoints.session, { cookieJar });
  // Language endpoint now requires authentication, so we skip it
  // Language will be set in the authentication URL instead
  return cookieJar;
}