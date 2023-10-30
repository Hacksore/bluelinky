import { CookieJar } from 'tough-cookie';
import { ChineseBrandEnvironment } from '../../constants/china';
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
export declare function initSession(environment: ChineseBrandEnvironment, cookies?: CookieJar): Promise<CookieJar>;
