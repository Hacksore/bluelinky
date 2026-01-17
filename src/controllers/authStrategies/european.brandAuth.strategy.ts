import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code, Token, initSession } from './authStrategy';
import { URLSearchParams } from 'url';

export class EuropeanBrandAuthStrategy implements AuthStrategy {
  constructor(
    private readonly environment: EuropeanBrandEnvironment,
    private readonly language: EULanguages
  ) {}

  public get name(): string {
    return 'EuropeanBrandAuthStrategy';
  }

  public async login(user: { username: string; password: string; }, options?: { cookieJar?: CookieJar }): Promise<{ code: Code | Token, cookies: CookieJar }> {
    const cookieJar = await initSession(this.environment, options?.cookieJar);

    const uri = this.environment.loginFormHost + this.environment.endpoints.tokenURL;

    const	headers = {
      'Content-type': 'application/x-www-form-urlencoded',
      'User-Agent':   'Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19_CCS_APP_AOS',
    };

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', user.password);
    formData.append('client_id', this.environment.ccspServiceID);
    formData.append('client_secret', this.environment.ccspServiceSecret);

    const authResponse = await got.post(uri, {
//      cookieJar,
      headers: headers,
      body: formData.toString(),
      followRedirect: true,
      throwHttpErrors: false,
    });

    if (authResponse.statusCode !== 200) {
      throw new Error(`@EuropeanBrandAuthStrategy.login: Could not get access_token from URL: ${uri}`);
    }

    const token = JSON.parse(authResponse.body) as Token;
    if (! token.refresh_token && user.password != '') {
      token.refresh_token = user.password;
    }

    //const code = '';
    return {
      code: token,
      cookies: cookieJar,
    };
  }
}