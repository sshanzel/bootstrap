import {
  CanActivate,
  Injectable,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { CookieService } from '../cookie/cookie.service';
import { TokenService } from './token.service';
import type { AuthenticatedRequest } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly cookies: CookieService,
    private readonly tokens: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.cookies.get(request, 'access');
    if (!accessToken) {
      throw new UnauthorizedException('No access token');
    }

    const payload = this.tokens.verifyAccessToken(accessToken);
    (request as AuthenticatedRequest).user = payload;
    return true;
  }
}
