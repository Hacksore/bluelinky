import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code, initSession } from './authStrategy';
import Url from 'url';

export class EuropeanLegacyAuthStrategy implements AuthStrategy {
  constructor(
    private readonly environment: EuropeanBrandEnvironment,
    private readonly language: EULanguages
  ) {}

  public get name(): string {
    return 'EuropeanLegacyAuthStrategy';
  }

  async login(
    user: { username: string; password: string },
    options?: { cookieJar: CookieJar }
  ): Promise<{ code: Code; cookies: CookieJar }> {
    const cookieJar = await initSession(this.environment, options?.cookieJar);
    const { body, statusCode } = await got(this.environment.endpoints.loginURL, {
      method: 'POST',
      json: true,
      body: {
        'email': user.username,
        'password': user.password,
      },
      cookieJar,
    });
    if (!body.redirectUrl) {
      throw new Error(
        `@EuropeanLegacyAuthStrategy.login: sign In didn't work, could not retrieve auth code. status: ${statusCode}, body: ${JSON.stringify(
          body
        )}`
      );
    }
    const { code } = Url.parse(body.redirectUrl, true).query;
    if (!code) {
      throw new Error(
        '@EuropeanLegacyAuthStrategy.login: AuthCode was not found, you probably need to migrate your account.'
      );
    }
    return {
      code: code as Code,
      cookies: cookieJar,
    };
  }
}
