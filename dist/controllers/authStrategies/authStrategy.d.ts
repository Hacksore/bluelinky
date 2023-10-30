import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
export declare type Code = string;
export interface AuthStrategy {
    readonly name: string;
    login(user: {
        username: string;
        password: string;
    }, options?: {
        cookieJar?: CookieJar;
    }): Promise<{
        code: Code;
        cookies: CookieJar;
    }>;
}
export declare function initSession(environment: EuropeanBrandEnvironment, language?: EULanguages, cookies?: CookieJar): Promise<CookieJar>;
