import got from 'got';
import { CookieJar } from 'tough-cookie';
import {ChineseBrandEnvironment } from '../../constants/china';

export type Code = string;

export interface AuthStrategy {
  readonly name: string;
  login(
    user: { username: string; password: string },
    options?: { cookieJar?: CookieJar }
  ): Promise<{ code: Code; cookies: CookieJar }>;
}

export async function initSession(
  environment: ChineseBrandEnvironment,
  cookies?: CookieJar
): Promise<CookieJar> {
  const cookieJar = cookies ?? new CookieJar();
  await got(environment.endpoints.session, { cookieJar });
  await got(environment.endpoints.language, {
    method: 'POST',
    body: `{"lang":"zh"}`,
    cookieJar,
  });
  return cookieJar;
}
