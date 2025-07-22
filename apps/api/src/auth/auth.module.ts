import { Module } from '@nestjs/common';
import { OAuthService } from './services/oauth.services';

@Module({
  providers: [OAuthService],
  exports: [OAuthService],
})
export class AuthModule {}
