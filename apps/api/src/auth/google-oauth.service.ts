import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';
import type { Request } from 'express';
import { CookieService } from '../cookie/cookie.service';
import { EnvService } from '../env/env.service';
import { UserService } from '../user/user.service';
import type { User } from '../user/user.entity';

@Injectable()
export class GoogleOAuthService {
  private readonly client: OAuth2Client;

  constructor(
    private readonly env: EnvService,
    private readonly cookies: CookieService,
    private readonly users: UserService,
  ) {
    this.client = new OAuth2Client({
      clientId: env.get('GOOGLE_CLIENT_ID'),
      clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.getRedirectUri(),
    });
  }

  buildStartUrl(state: string): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
      state,
    });
  }

  issueStateCookie(req: Request): string {
    const existingState = this.cookies.get(req, 'oauthState');
    if (existingState) {
      return existingState;
    }
    return randomBytes(24).toString('hex');
  }

  async authenticateCallback(
    code: string,
    state: string,
    req: Request,
  ): Promise<User> {
    const storedState = this.cookies.get(req, 'oauthState');
    if (!storedState || storedState !== state) {
      throw new UnauthorizedException('Invalid OAuth state');
    }

    const { tokens } = await this.client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) {
      throw new BadRequestException('Google did not return an ID token');
    }

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.env.get('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new BadRequestException('Google account payload is incomplete');
    }

    return this.users.findOrCreateGoogleUser({
      email: payload.email,
      googleId: payload.sub,
      firstName: payload.given_name ?? null,
      lastName: payload.family_name ?? null,
    });
  }

  getRedirectUri(): string {
    return `${this.env.get('API_BASE_URL').replace(/\/+$/, '')}/api/auth/google/callback`;
  }

  getFailureRedirectUrl(): string {
    return `${this.env.get('FRONTEND_URL').replace(/\/+$/, '')}/login?error=google_auth_failed`;
  }

  getSuccessRedirectUrl(): string {
    return `${this.env.get('FRONTEND_URL').replace(/\/+$/, '')}/app`;
  }
}
