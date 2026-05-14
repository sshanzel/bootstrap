import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CookieModule } from './cookie/cookie.module';
import { APP_ENTITIES } from './db/entities';
import { dataSourceOptions } from './db/typeorm.config';
import { EnvModule } from './env/env.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    EnvModule,
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature(APP_ENTITIES),
    CookieModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
