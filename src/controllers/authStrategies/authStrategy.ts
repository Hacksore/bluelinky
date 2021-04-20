import got from 'got';
import { CookieJar } from 'tough-cookie';
import { DEFAULT_LANGUAGE, EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';

export type Code = string;

export interface AuthStrategy {
    readonly name: string;
    login(user: { username: string, password: string }, options?: { cookieJar?: CookieJar }): Promise<{ code: Code, cookies: CookieJar }>;
}

export async function initSession(environment: EuropeanBrandEnvironment, language: EULanguages = DEFAULT_LANGUAGE, cookies?: CookieJar): Promise<CookieJar> {
    const cookieJar = cookies ?? new CookieJar();
    await got(environment.endpoints.session, { cookieJar });
    await got(environment.endpoints.language, { method: 'POST', body: `{"lang":"${language}"}`, cookieJar });
    return cookieJar;
}
