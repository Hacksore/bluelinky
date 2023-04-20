import got from 'got';
import { CookieJar } from 'tough-cookie';
import { ChineseBrandEnvironment } from '../../constants/china';
import { AuthStrategy, Code, initSession } from './china.authStrategy';
import Url from 'url';

export class ChineseLegacyAuthStrategy implements AuthStrategy {
  constructor(
    private readonly environment: ChineseBrandEnvironment,
  ) {}

  public get name(): string {
    return 'ChineseLegacyAuthStrategy';
  }

  async login(
    user: { username: string; password: string },
    options?: { cookieJar: CookieJar }
  ): Promise<{ code: Code; cookies: CookieJar }> {
    const cookieJar = await initSession(this.environment, options?.cookieJar);
    const { body, statusCode } = await got(this.environment.endpoints.login, {
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
        `@ChineseLegacyAuthStrategy.login: sign In didn't work, could not retrieve auth code. status: ${statusCode}, body: ${JSON.stringify(
          body
        )}`
      );
    }
    const { code } = Url.parse(body.redirectUrl, true).query;
    if (!code) {
      throw new Error(
        '@ChineseLegacyAuthStrategy.login: AuthCode was not found, you probably need to migrate your account.'
      );
    }
    return {
      code: code as Code,
      cookies: cookieJar,
    };
  }
}
