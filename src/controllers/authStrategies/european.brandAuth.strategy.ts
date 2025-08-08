import got from 'got';
import { CookieJar } from 'tough-cookie';
import { EULanguages, EuropeanBrandEnvironment } from '../../constants/europe';
import { AuthStrategy, Code, initSession } from './authStrategy';
import { URLSearchParams } from 'url';

const stdHeaders = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 Mobile/15B92 Safari/604.1',
};

export class EuropeanBrandAuthStrategy implements AuthStrategy {
  constructor(
    private readonly environment: EuropeanBrandEnvironment,
    private readonly language: EULanguages
  ) {}

  public get name(): string {
    return 'EuropeanBrandAuthStrategy';
  }

  public async login(user: { username: string; password: string; }, options?: { cookieJar?: CookieJar }): Promise<{ code: Code, cookies: CookieJar }> {
    const cookieJar = await initSession(this.environment, options?.cookieJar);

    // Build the correct auth URL based on the new KIA/Hyundai authentication
    const authHost = this.environment.brand === 'kia'
      ? 'idpconnect-eu.kia.com'
      : 'idpconnect-eu.hyundai.com';

    const authUrl = `https://${authHost}/auth/api/v2/user/oauth2/authorize?response_type=code&client_id=${this.environment.clientId}&redirect_uri=${this.environment.baseUrl}/api/v1/user/oauth2/redirect&lang=${this.language}&state=ccsp`;

    // Step 1: GET request to auth URL to get connector_session_key
    const authResponse = await got(authUrl, {
      cookieJar,
      headers: stdHeaders,
      followRedirect: true,
      throwHttpErrors: false,
    });

    // Extract connector_session_key from the final URL after redirects
    const urlToCheck = authResponse.url;

    // Try multiple regex patterns to find the session key
    let connectorSessionKey: string | null = null;

    // Pattern 1: URL encoded
    let match = urlToCheck.match(/connector_session_key%3D([0-9a-fA-F-]{36})/);
    if (match) {
      connectorSessionKey = match[1];
    }

    // Pattern 2: Not URL encoded
    if (!connectorSessionKey) {
      match = urlToCheck.match(/connector_session_key=([0-9a-fA-F-]{36})/);
      if (match) {
        connectorSessionKey = match[1];
      }
    }

    if (!connectorSessionKey) {
      throw new Error(`@EuropeanBrandAuthStrategy.login: Could not extract connector_session_key from URL: ${urlToCheck}`);
    }

    // Step 2: POST to signin endpoint
    const signinUrl = `https://${authHost}/auth/account/signin`;

    const formData = new URLSearchParams();
    formData.append('client_id', this.environment.clientId);
    formData.append('encryptedPassword', 'false');
    formData.append('orgHmgSid', '');
    formData.append('password', user.password);
    formData.append('redirect_uri', `${this.environment.baseUrl}/api/v1/user/oauth2/redirect`);
    formData.append('state', 'ccsp');
    formData.append('username', user.username);
    formData.append('remember_me', 'false');
    formData.append('connector_session_key', connectorSessionKey);
    formData.append('_csrf', '');

    const signinResponse = await got.post(signinUrl, {
      cookieJar,
      body: formData.toString(),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'origin': `https://${authHost}`,
        ...stdHeaders
      },
      followRedirect: false,
      throwHttpErrors: false,
    });

    if (signinResponse.statusCode !== 302) {
      throw new Error(`@EuropeanBrandAuthStrategy.login: Signin failed with status ${signinResponse.statusCode}: ${signinResponse.body}`);
    }

    // Step 3: Extract authorization code from Location header
    const location = signinResponse.headers.location;
    if (!location) {
      throw new Error('@EuropeanBrandAuthStrategy.login: No redirect location found after signin');
    }

    const codeMatch = location.match(/code=([0-9a-fA-F-]{36}\.[0-9a-fA-F-]{36}\.[0-9a-fA-F-]{36})/);
    if (!codeMatch) {
      // Try alternative patterns for different code formats
      const altMatch = location.match(/code=([^&]+)/);
      if (altMatch) {
        const code = altMatch[1];
        return { code: code as Code, cookies: cookieJar };
      }
      throw new Error(`@EuropeanBrandAuthStrategy.login: Could not extract authorization code from redirect location: ${location}`);
    }

    const code = codeMatch[1];

    return {
      code: code as Code,
      cookies: cookieJar,
    };
  }
}