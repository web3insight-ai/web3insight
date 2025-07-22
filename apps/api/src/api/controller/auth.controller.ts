import { OAuthService } from '@/auth/services/oauth.services';
import { Body, Controller, Post } from '@nestjs/common';
import { LoginReqDto } from '../dto/api.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly oauthServices: OAuthService) {}

  @Post('login/oauth/code')
  async login(@Body() body: LoginReqDto) {
    return this.oauthServices.login(body);
  }
}
