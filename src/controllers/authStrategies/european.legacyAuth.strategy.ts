import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code } from './authStrategy';
import Url from 'url';

export class EuropeanLegacyAuthStrategy implements AuthStrategy {
	constructor(private readonly environment: EuropeanBrandEnvironment) { }

	public get name(): string {
		return 'EuropeanLegacyAuthStrategy';
	}

	async login(user: { username: string; password: string; }, { cookieJar }: { cookieJar: CookieJar }): Promise<Code> {
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
		return code as Code;
	}
}