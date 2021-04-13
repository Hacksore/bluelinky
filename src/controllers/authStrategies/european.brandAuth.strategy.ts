import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code } from './authStrategy';
import Url from 'url';

const stdHeaders = {
	'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 Mobile/15B92 Safari/604.1'
};

const manageGot302 = <T extends Buffer | string | Record<string, unknown>>(got: Promise<got.Response<T>>): Promise<got.Response<T>> => {
	return got.catch((error) => {
		if (error.name === 'HTTPError' && error.statusCode === 302) {
			return error.response;
		}
		return Promise.reject(error);
	});
};

export class EuropeanBrandAuthStrategy implements AuthStrategy {
	constructor(private readonly environment: EuropeanBrandEnvironment, private readonly language: EULanguages) { }

	public get name(): string {
		return 'EuropeanBrandAuthStrategy';
	}

	public async login(user: { username: string; password: string; }, { cookieJar }: { cookieJar: CookieJar }): Promise<Code> {
		const { body: { userId, serviceId } } = await got(this.environment.endpoints.integration, {
			cookieJar,
			json: true,
			headers: stdHeaders
		});
		const { body: htmlForm } = await got(
			this.environment.brandAuthUrl({ language: this.language, userId, serviceId }), {
			cookieJar,
			headers: stdHeaders
		});
		const actionUrl = /action="([a-z0-9:/\-.?_=&;]*)"/gi.exec(htmlForm);
		const preparedUrl = actionUrl?.[1].replace(/&amp;/g, '&');
		if (!preparedUrl) {
			throw new Error('@EuropeanBrandAuthStrategy.login: cannot found the auth url from the form.');
		}
		const { headers: { location: redirectTo }, body } = await manageGot302(got.post(preparedUrl, {
			cookieJar,
			body: `username=${user.username}&rememberMe=on&password=${user.password}&credentialId=`, // TODO have a better management of the query string encoding
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				...stdHeaders
			},
		}));
		if(!redirectTo) {
			const errorMessage = /<span class="kc-feedback-text">(.+)<\/span>/gm.exec(body);
			if (errorMessage) {
				throw new Error(`@EuropeanBrandAuthStrategy.login: Authentication failed with message : ${errorMessage[1]}`);
			}
			throw new Error('@EuropeanBrandAuthStrategy.login: Authentication failed, cannot retrieve error message');
		}
		const { url } = await got(redirectTo, {
			cookieJar,
			headers: stdHeaders
		});
		const { userId: appUser } = Url.parse(url, true).query;
		if (!appUser) {
			throw new Error(`@EuropeanBrandAuthStrategy.login: Cannot find the argument userId in ${url}.`);
		}
		const { body: { redirectUrl } } = await got.post(this.environment.endpoints.silentSignIn, {
			cookieJar,
			body: {
				userId: appUser
			},
			json: true,
			headers: {
				...stdHeaders,
				'ccsp-service-id': this.environment.clientId,
			}
		});
		const { code } = Url.parse(redirectUrl, true).query;
		if (!code) {
			throw new Error(`@EuropeanBrandAuthStrategy.login: Cannot find the argument code in ${redirectUrl}.`);
		}
		return code as Code;
	}
}