import { CookieJar } from 'tough-cookie';

export type Code = string;

export interface AuthStrategy {
    readonly name: string;
    login(user: { username: string, password: string }, options: { cookieJar: CookieJar }): Promise<Code>;
}