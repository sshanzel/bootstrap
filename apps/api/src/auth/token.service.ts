import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Response } from 'express';
import { MoreThan, Repository } from 'typeorm';
import { CookieService } from '../cookie/cookie.service';
import type { User } from '../user/user.entity';
import { RefreshToken } from './refresh-token.entity';

export interface TokenPayload {
  sub: string;
  email: string;
}

const ACCESS_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly cookies: CookieService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  generateAccessToken(user: User): string {
    return this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
      } satisfies TokenPayload,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return this.jwt.verify<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async createRefreshToken(userId: string): Promise<RefreshToken> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      expiresAt,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async rotateRefreshToken(tokenId: string): Promise<User> {
    const existing = await this.refreshTokenRepository.findOne({
      where: { id: tokenId, expiresAt: MoreThan(new Date()) },
      relations: ['user'],
    });
    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.delete(existing.id);
    const nextRefreshToken = await this.createRefreshToken(existing.user.id);
    return this.issueSessionCookiesFromRefresh(
      existing.user,
      nextRefreshToken.id,
    );
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.delete(tokenId);
  }

  async issueSession(res: Response, user: User): Promise<void> {
    const refreshToken = await this.createRefreshToken(user.id);
    this.cookies.set(res, 'access', this.generateAccessToken(user));
    this.cookies.set(res, 'refresh', refreshToken.id);
  }

  clearSession(res: Response): void {
    this.cookies.clear(res, 'access');
    this.cookies.clear(res, 'refresh');
  }

  private issueSessionCookiesFromRefresh(
    user: User,
    refreshTokenId: string,
  ): User {
    (user as User & { nextRefreshTokenId?: string }).nextRefreshTokenId =
      refreshTokenId;
    return user;
  }

  applyRotatedSession(res: Response, user: User): void {
    const nextRefreshTokenId = (user as User & { nextRefreshTokenId?: string })
      .nextRefreshTokenId;
    if (!nextRefreshTokenId) {
      throw new UnauthorizedException('Refresh token rotation failed');
    }
    this.cookies.set(res, 'access', this.generateAccessToken(user));
    this.cookies.set(res, 'refresh', nextRefreshTokenId);
  }
}
