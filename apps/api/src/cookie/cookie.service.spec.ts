import { describe, expect, it } from '@jest/globals';
import type { Response } from 'express';
import { CookieService } from './cookie.service';
import { EnvService } from '../env/env.service';

interface CookieStubResponse {
  cookie: (name: string, value: string, options: unknown) => CookieStubResponse;
}

interface EnvServiceOptions {
  cookieDomain?: string;
}

function createEnvService(
  nodeEnv: 'development' | 'production',
  options: EnvServiceOptions = {},
): EnvService {
  process.env.PORT = '4000';
  process.env.NODE_ENV = nodeEnv;
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5434/bootstrap';
  process.env.JWT_SECRET = 'secret';
  if (options.cookieDomain === undefined) {
    delete process.env.COOKIE_DOMAIN;
  } else {
    process.env.COOKIE_DOMAIN = options.cookieDomain;
  }
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.API_BASE_URL = 'http://localhost:4000';
  process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
  process.env.GOOGLE_CLIENT_ID = 'client';
  process.env.GOOGLE_CLIENT_SECRET = 'secret';
  return new EnvService();
}

describe('CookieService', () => {
  function recordCookieOptions(
    cookieService: CookieService,
    kind: 'access' | 'refresh',
  ): unknown {
    const response: CookieStubResponse = {
      cookie: (_name: string, _value: string, _options: unknown) => response,
    };
    let recorded: unknown;
    response.cookie = (_name, _value, options) => {
      recorded = options;
      return response;
    };

    cookieService.set(response as unknown as Response, kind, 'token');

    return recorded;
  }

  it('uses host-only lax cookies for localhost development', () => {
    const cookieService = new CookieService(
      createEnvService('development', { cookieDomain: 'localhost' }),
    );
    const recorded = recordCookieOptions(cookieService, 'access');

    expect(recorded).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(recorded).not.toHaveProperty('domain');
  });

  it('uses secure none cookies in production', () => {
    const cookieService = new CookieService(
      createEnvService('production', { cookieDomain: 'bootstrap.example' }),
    );
    const recorded = recordCookieOptions(cookieService, 'refresh');

    expect(recorded).toMatchObject({
      secure: true,
      sameSite: 'none',
      domain: 'bootstrap.example',
    });
  });

  it('omits loopback domains that browsers reject as cookie domains', () => {
    const cookieService = new CookieService(
      createEnvService('development', { cookieDomain: '127.0.0.1' }),
    );
    const recorded = recordCookieOptions(cookieService, 'access');

    expect(recorded).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(recorded).not.toHaveProperty('domain');
  });

  it('omits LAN IP domains for mobile development cookies', () => {
    const cookieService = new CookieService(
      createEnvService('development', { cookieDomain: '192.168.1.44' }),
    );
    const recorded = recordCookieOptions(cookieService, 'access');

    expect(recorded).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(recorded).not.toHaveProperty('domain');
  });

  it('omits localhost domains when copied with a port', () => {
    const cookieService = new CookieService(
      createEnvService('development', { cookieDomain: 'localhost:4000' }),
    );
    const recorded = recordCookieOptions(cookieService, 'access');

    expect(recorded).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(recorded).not.toHaveProperty('domain');
  });

  it('omits bracketed IPv6 domains when copied from a URL', () => {
    const cookieService = new CookieService(
      createEnvService('development', { cookieDomain: 'http://[::1]:4000' }),
    );
    const recorded = recordCookieOptions(cookieService, 'access');

    expect(recorded).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(recorded).not.toHaveProperty('domain');
  });

  it('strips ports from deploy domains before setting cookies', () => {
    const cookieService = new CookieService(
      createEnvService('production', {
        cookieDomain: 'https://bootstrap.example:443',
      }),
    );
    const recorded = recordCookieOptions(cookieService, 'access');

    expect(recorded).toMatchObject({
      secure: true,
      sameSite: 'none',
      domain: 'bootstrap.example',
    });
  });

  it('omits domain for host-only development cookies', () => {
    const cookieService = new CookieService(createEnvService('development'));
    const recorded = recordCookieOptions(cookieService, 'access');

    expect(recorded).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(recorded).not.toHaveProperty('domain');
  });
});
