import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  authResponseSchema,
  loginSchema,
  meResponseSchema,
  registerSchema,
  type AuthResponse,
  type MeResponse,
} from '@bootstrap/shared';
import { CookieService } from '../cookie/cookie.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from './auth.guard';
import { presentAuthUser } from './auth.presenter';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { GoogleOAuthService } from './google-oauth.service';
import { TokenService, type TokenPayload } from './token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserService,
    private readonly tokens: TokenService,
    private readonly cookies: CookieService,
    private readonly googleOAuth: GoogleOAuthService,
  ) {}

  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const input = registerSchema.parse(body);
    const user = await this.auth.register(input);
    await this.tokens.issueSession(res, user);
    return authResponseSchema.parse({ user: presentAuthUser(user) });
  }

  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const input = loginSchema.parse(body);
    const user = await this.auth.login(input);
    await this.tokens.issueSession(res, user);
    return authResponseSchema.parse({ user: presentAuthUser(user) });
  }

  @Get('google/start')
  startGoogleAuth(@Req() req: Request, @Res() res: Response): void {
    const state = this.googleOAuth.issueStateCookie(req);
    this.cookies.set(res, 'oauthState', state);
    res.redirect(this.googleOAuth.buildStartUrl(state));
  }

  @Get('google/callback')
  async handleGoogleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const code =
      typeof req.query.code === 'string' ? req.query.code : undefined;
    const state =
      typeof req.query.state === 'string' ? req.query.state : undefined;
    if (!code || !state) {
      this.cookies.clear(res, 'oauthState');
      res.redirect(this.googleOAuth.getFailureRedirectUrl());
      return;
    }

    try {
      const user = await this.googleOAuth.authenticateCallback(
        code,
        state,
        req,
      );
      await this.tokens.issueSession(res, user);
      this.cookies.clear(res, 'oauthState');
      res.redirect(this.googleOAuth.getSuccessRedirectUrl());
    } catch {
      this.cookies.clear(res, 'oauthState');
      res.redirect(this.googleOAuth.getFailureRedirectUrl());
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() payload: TokenPayload): Promise<MeResponse> {
    const user = await this.users.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return meResponseSchema.parse({ user: presentAuthUser(user) });
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refreshTokenId = this.cookies.get(req, 'refresh');
    if (!refreshTokenId) {
      throw new UnauthorizedException('No refresh token');
    }

    const user = await this.tokens.rotateRefreshToken(refreshTokenId);
    this.tokens.applyRotatedSession(res, user);
    return { ok: true };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refreshTokenId = this.cookies.get(req, 'refresh');
    if (refreshTokenId) {
      await this.tokens.revokeRefreshToken(refreshTokenId);
    }
    this.tokens.clearSession(res);
    return { ok: true };
  }
}
