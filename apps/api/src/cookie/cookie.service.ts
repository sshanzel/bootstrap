import { isIP } from 'node:net';
import { Injectable } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { EnvService } from '../env/env.service';

interface CookieKindConfig {
  name: string;
  path?: string;
  maxAge: number;
}

const COOKIE_KIND_CONFIGS = {
  access: {
    name: 'accessToken',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  refresh: {
    name: 'refreshToken',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
  oauthState: {
    name: 'googleOAuthState',
    path: '/api/auth/google',
    maxAge: 10 * 60 * 1000,
  },
} satisfies Record<string, CookieKindConfig>;

type CookieKind = keyof typeof COOKIE_KIND_CONFIGS;

const LOCAL_COOKIE_DOMAINS = new Set(['localhost', '127.0.0.1', '::1']);

function normalizeCookieDomain(domain: string | undefined): string | undefined {
  if (!domain) {
    return undefined;
  }

  const trimmedDomain = domain.trim();
  if (!trimmedDomain) {
    return undefined;
  }

  if (trimmedDomain.includes('://')) {
    try {
      const parsedUrl = new URL(trimmedDomain);
      return stripPortAndIpv6Brackets(parsedUrl.hostname).toLowerCase();
    } catch {
      return stripPortAndIpv6Brackets(trimmedDomain).toLowerCase();
    }
  }

  return stripPortAndIpv6Brackets(trimmedDomain).toLowerCase();
}

function stripPortAndIpv6Brackets(domain: string): string {
  if (domain.startsWith('[')) {
    const bracketEndIndex = domain.indexOf(']');
    if (bracketEndIndex > 0) {
      return domain.slice(1, bracketEndIndex);
    }
  }

  const firstColonIndex = domain.indexOf(':');
  const hasSingleColon =
    firstColonIndex !== -1 && domain.indexOf(':', firstColonIndex + 1) === -1;
  if (hasSingleColon) {
    return domain.slice(0, firstColonIndex);
  }

  return domain;
}

@Injectable()
export class CookieService {
  constructor(private readonly env: EnvService) {}

  set(res: Response, kind: CookieKind, value: string): void {
    const config = COOKIE_KIND_CONFIGS[kind];
    res.cookie(config.name, value, this.buildSetOptions(config));
  }

  clear(res: Response, kind: CookieKind): void {
    const config = COOKIE_KIND_CONFIGS[kind];
    res.clearCookie(config.name, this.buildBaseOptions(config));
  }

  get(req: Request, kind: CookieKind): string | undefined {
    return req.cookies?.[COOKIE_KIND_CONFIGS[kind].name];
  }

  private buildBaseOptions(config: CookieKindConfig): CookieOptions {
    const domain = this.getCookieDomain();
    return {
      httpOnly: true,
      secure: this.env.isProduction,
      sameSite: this.env.isProduction ? 'none' : 'lax',
      ...(domain ? { domain } : {}),
      path: config.path,
    };
  }

  private getCookieDomain(): string | undefined {
    const domain = normalizeCookieDomain(this.env.get('COOKIE_DOMAIN'));
    if (!domain || LOCAL_COOKIE_DOMAINS.has(domain) || isIP(domain) !== 0) {
      return undefined;
    }

    return domain;
  }

  private buildSetOptions(config: CookieKindConfig): CookieOptions {
    return {
      ...this.buildBaseOptions(config),
      maxAge: config.maxAge,
    };
  }
}
