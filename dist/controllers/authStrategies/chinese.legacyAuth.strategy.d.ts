import { CookieJar } from 'tough-cookie';
import { ChineseBrandEnvironment } from '../../constants/china';
import { AuthStrategy, Code } from './china.authStrategy';
export declare class ChineseLegacyAuthStrategy implements AuthStrategy {
    private readonly environment;
    constructor(environment: ChineseBrandEnvironment);
    get name(): string;
    login(user: {
        username: string;
        password: string;
    }, options?: {
        cookieJar: CookieJar;
    }): Promise<{
        code: Code;
        cookies: CookieJar;
    }>;
}
