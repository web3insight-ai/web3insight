import { AuthService } from '@/auth/services/auth.services';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginReqDto } from '../dto/api.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppAuthGuard } from '@/auth/app.auth.guard';
import { RequestWithUser } from '@/auth/auth.jwt.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  @Post('login/oauth')
  @ApiOperation({
    summary: 'Use oauth code to login',
    description: '',
  })
  async login(@Body() body: LoginReqDto) {
    return this.authServices.login(body);
  }

  @Get('user')
  @ApiOperation({
    summary: 'Get user profile',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getUser(@Req() req: RequestWithUser) {
    return this.authServices.getUserInfo(req.user.uid);
  }
}
