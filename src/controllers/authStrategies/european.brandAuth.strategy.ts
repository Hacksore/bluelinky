import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code, initSession } from './authStrategy';
//import Url, 
import { URLSearchParams } from 'url';

const stdHeaders = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 Mobile/15B92 Safari/604.1',
};

const manageGot302 = <T extends Buffer | string | Record<string, unknown>>(
  got: Promise<got.Response<T>>
): Promise<got.Response<T>> => {
  return got.catch(error => {
    if (error.name === 'HTTPError' && error.statusCode === 302) {
      return error.response;
    }
    return Promise.reject(error);
  });
};

export class EuropeanBrandAuthStrategy implements AuthStrategy {
  constructor(
    private readonly environment: EuropeanBrandEnvironment,
    private readonly language: EULanguages
  ) {}

  public get name(): string {
    return 'EuropeanBrandAuthStrategy';
  }

	public async login(user: { username: string; password: string; }, options?: { cookieJar?: CookieJar }): Promise<{ code: Code, cookies: CookieJar }> {
    const cookieJar = await initSession(this.environment, options?.cookieJar);
		const { body: { userId, serviceId } } = await got(this.environment.endpoints.integration, {
			cookieJar,
			json: true,
			headers: stdHeaders
		});
		const brandAuthUrl = this.environment.brandAuthUrl({ language: this.language, userId, serviceId });
		//const parsedBrandUrl = Url.parse(brandAuthUrl, true);
		//const { body: authForm } = 
    await got(
			brandAuthUrl, {
			cookieJar,
			headers: stdHeaders
		});

    const authUrl = `${this.environment.idpUrl}/auth/api/v2/user/oauth2/authorize`;
    const params = {
      response_type: 'code',
      client_id: serviceId,
      redirect_uri: this.environment.endpoints.redirectUri, // `${this.environment.baseUrl}/api/v1/user/oauth2/redirect`,
      state: 'ccsp',
      lang: 'en'
    };
    await got(authUrl, { params });

    const loginUrl = `${this.environment.idpUrl}/auth/account/signin`;
    const loginData = new URLSearchParams({
      username: user.username,
      password: user.password,
      encryptedPassword: 'false',
      remember_me: 'false',
      redirect_uri: this.environment.endpoints.redirectUri, //  `${this.environment.baseUrl}/api/v1/user/oauth2/redirect`,
      state: 'ccsp',
      client_id: this.environment.clientId
    });
    const { headers: { location: redirectTo }, body: afterAuthForm } = await manageGot302(got.post(loginUrl,  {
      body: loginData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      followRedirect: false, // equivalent to maxRedirects: 0
      throwHttpErrors: false // needed so it doesn't throw on 302
    }));

		if(!redirectTo) {
			const errorMessage = /<span class="kc-feedback-text">(.+)<\/span>/gm.exec(afterAuthForm);
			if (errorMessage) {
				throw new Error(`@EuropeanBrandAuthStrategy.login: Authentication failed with message : ${errorMessage[1]}`);
			}
			throw new Error('@EuropeanBrandAuthStrategy.login: Authentication failed, cannot retrieve error message');
		}
    const parsedUrl = new URL(redirectTo);
    const code = parsedUrl.searchParams.get('code');
    
		if (!code) {
			throw new Error(`@EuropeanBrandAuthStrategy.login: Cannot find the argument code in ${body.redirectUrl}.`);
		}
		return {
			code: code as Code,
			cookies: cookieJar,
		};
	}
}
