import { CookieJar } from 'tough-cookie';
import { AuthStrategy, Code } from './authStrategy';
import { AustraliaBrandEnvironment } from '../../constants/australia';
export declare class AustraliaAuthStrategy implements AuthStrategy {
    private readonly environment;
    constructor(environment: AustraliaBrandEnvironment);
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
