import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code, initSession } from './authStrategy';
import Url from 'url';

export class EuropeanLegacyAuthStrategy implements AuthStrategy {
	constructor(private readonly environment: EuropeanBrandEnvironment, private readonly language: EULanguages) { }

	public get name(): string {
		return 'EuropeanLegacyAuthStrategy';
	}

	async login(user: { username: string; password: string; }, options?: { cookieJar: CookieJar }): Promise<{ code: Code, cookies: CookieJar }> {
		const cookieJar = await initSession(this.environment, this.language, options?.cookieJar);
		const { body: { redirectUrl } } = await got(this.environment.endpoints.login, {
			method: 'POST',
			json: true,
			body: {
				'email': user.username,
				'password': user.password,
			},
			cookieJar,
		});
		const { code } = Url.parse(redirectUrl, true).query;
		if (!code) {
			throw new Error('@EuropeanLegacyAuthStrategy.login: AuthCode was not found, you probably need to migrate your account.');
		}
		return {
			code: code as Code,
			cookies: cookieJar,
		};
	}
}