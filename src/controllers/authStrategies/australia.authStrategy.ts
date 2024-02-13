import got from 'got';
import { CookieJar } from 'tough-cookie';
import { AuthStrategy, Code } from './authStrategy';
import Url from 'url';
import { AustraliaBrandEnvironment } from '../../constants/australia';

export class AustraliaAuthStrategy implements AuthStrategy {
  constructor(private readonly environment: AustraliaBrandEnvironment) {}

  public get name(): string {
    return 'AustraliaAuthStrategy';
  }

  async login(
    user: { username: string; password: string },
    options?: { cookieJar: CookieJar }
  ): Promise<{ code: Code; cookies: CookieJar }> {
    const cookieJar = options?.cookieJar ?? new CookieJar();
    await got(this.environment.endpoints.session, { cookieJar });
    const { body: bodyStr, statusCode } = await got(this.environment.endpoints.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        'email': user.username,
        'password': user.password,
        'mobileNum': '',
      }),
      cookieJar,
    });
    const body = JSON.parse(bodyStr);
    if (!body.redirectUrl) {
      throw new Error(
        `@AustraliaAuthStrategy.login: sign In didn't work, could not retrieve auth code. status: ${statusCode}, body: ${JSON.stringify(
          body
        )}`
      );
    }
    const { code } = Url.parse(body.redirectUrl, true).query;
    if (!code) {
      throw new Error(
        '@AustraliaAuthStrategy.login: AuthCode was not found, you probably need to migrate your account.'
      );
    }
    return {
      code: code as Code,
      cookies: cookieJar,
    };
  }
}
