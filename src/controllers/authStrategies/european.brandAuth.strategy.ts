import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code, initSession } from './authStrategy';
import Url, { URLSearchParams } from 'url';

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

	public async login(user: { username: string; password: string; }, options?: { cookieJar?: CookieJar }): Promise<{ code: Code, cookies: CookieJar }> {
		const cookieJar = await initSession(this.environment, this.language, options?.cookieJar);
		const { body: { userId, serviceId } } = await got(this.environment.endpoints.integration, {
			cookieJar,
			json: true,
			headers: stdHeaders
		});
		const brandAuthUrl = this.environment.brandAuthUrl({ language: this.language, userId, serviceId });
		const parsedBrandUrl = Url.parse(brandAuthUrl, true);
		const { body: authForm } = await got(
			brandAuthUrl, {
			cookieJar,
			headers: stdHeaders
		});
		const actionUrl = /action="([a-z0-9:/\-.?_=&;]*)"/gi.exec(authForm);
		const preparedUrl = actionUrl?.[1].replace(/&amp;/g, '&');
		if (!preparedUrl) {
			throw new Error('@EuropeanBrandAuthStrategy.login: cannot found the auth url from the form.');
		}
		const formData = new URLSearchParams();
		formData.append('username', user.username);
		formData.append('password', user.password);
		formData.append('credentialId', '');
		formData.append('rememberMe', 'on');
		const { headers: { location: redirectTo }, body: afterAuthForm } = await manageGot302(got.post(preparedUrl, {
			cookieJar,
			body: formData.toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				...stdHeaders
			},
		}));
		if(!redirectTo) {
			const errorMessage = /<span class="kc-feedback-text">(.+)<\/span>/gm.exec(afterAuthForm);
			if (errorMessage) {
				throw new Error(`@EuropeanBrandAuthStrategy.login: Authentication failed with message : ${errorMessage[1]}`);
			}
			throw new Error('@EuropeanBrandAuthStrategy.login: Authentication failed, cannot retrieve error message');
		}
		const authResult = await got(redirectTo, {
			cookieJar,
			headers: stdHeaders
		});
		let url = authResult.url;
		let htmlPage = authResult.body;
		if(!url) {
			throw new Error(`@EuropeanBrandAuthStrategy.login: after login redirection got stuck : ${htmlPage}`);
		}
		if(url.includes('login-actions/required-action')) {
			const loginActionUrl = /action="([a-z0-9:/\-.?_=&;]*)"/gi.exec(htmlPage);
			const loginActionCode = /name="code" value="(.*)"/gi.exec(htmlPage);
			if (!loginActionUrl) {
				throw new Error('@EuropeanBrandAuthStrategy.login: Cannot find login-actions url.');
			}
			if (!loginActionCode) {
				throw new Error('@EuropeanBrandAuthStrategy.login: Cannot find login-actions code.');
			}
			const actionUrl = (loginActionUrl[1].startsWith('/')) ? `${parsedBrandUrl.protocol}//${parsedBrandUrl.host}${loginActionUrl[1]}` : loginActionUrl[1];
			const loginActionForm = new URLSearchParams();
			loginActionForm.append('code', loginActionCode[1]);
			loginActionForm.append('accept', '');
			const { headers: { location: loginActionRedirect }, body: AfterLoginActionAuthForm  } = await manageGot302(got.post(actionUrl, {
				cookieJar,
				body: loginActionForm.toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					...stdHeaders
				},
			}));
			if(!loginActionRedirect) {
				const errorMessage = /<span class="kc-feedback-text">(.+)<\/span>/gm.exec(AfterLoginActionAuthForm);
				if (errorMessage) {
					throw new Error(`@EuropeanBrandAuthStrategy.login: Authentication action failed with message : ${errorMessage[1]}`);
				}
				throw new Error('@EuropeanBrandAuthStrategy.login: Authentication action failed, cannot retrieve error message');
			}
			const authResult = await got(loginActionRedirect, {
				cookieJar,
				headers: stdHeaders
			});
			url = authResult.url;
			htmlPage = authResult.body;
		}
		const { intUserId: appUser } = Url.parse(url, true).query;
		if (!appUser) {
			throw new Error(`@EuropeanBrandAuthStrategy.login: Cannot find the argument userId in ${url}.`);
		}
		const { body, statusCode } = await got.post(this.environment.endpoints.silentSignIn, {
			cookieJar,
			body: {
				intUserId: appUser
			},
			json: true,
			headers: {
				...stdHeaders,
				'ccsp-service-id': this.environment.clientId,
			}
		});
		if(!body.redirectUrl) {
			throw new Error(`@EuropeanBrandAuthStrategy.login: silent sign In didn't work, could not retrieve auth code. status: ${statusCode}, body: ${JSON.stringify(body)}`);
		}
		const { code } = Url.parse(body.redirectUrl, true).query;
		if (!code) {
			throw new Error(`@EuropeanBrandAuthStrategy.login: Cannot find the argument code in ${body.redirectUrl}.`);
		}
		return {
			code: code as Code,
			cookies: cookieJar,
		};
	}
}