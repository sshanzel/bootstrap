import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CookieModule } from '../cookie/cookie.module';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { RefreshToken } from './refresh-token.entity';
import { TokenService } from './token.service';

@Module({
  imports: [
    EnvModule,
    UserModule,
    CookieModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        secret: env.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, AuthGuard, GoogleOAuthService],
})
export class AuthModule {}
