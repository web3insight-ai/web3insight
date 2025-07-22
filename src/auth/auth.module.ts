import { Module } from '@nestjs/common';
import { OAuthService } from './services/oauth.services';
import { JwtService } from '@nestjs/jwt';
import { DBModule } from '@/app/db/db.module';

@Module({
  imports: [DBModule],
  providers: [OAuthService, JwtService],
  exports: [OAuthService],
})
export class AuthModule {}
