import { AuthService } from '@/auth/services/auth.services';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  AuthBindWalletReqDto,
  BindOAuthReqDto,
  LoginReqDto,
} from '../dto/api.dto';
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
    return this.authServices.getUserInfo(req.user);
  }

  @Get('magic')
  @ApiOperation({
    summary: 'Get magic number',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getMagic(@Req() req: RequestWithUser) {
    return this.authServices.genMagicNumber(req.user.uid);
  }

  @Post('bind/wallet')
  @ApiOperation({
    summary: 'Bind wallet address to user',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async bindWallet(
    @Req() req: RequestWithUser,
    @Body() body: AuthBindWalletReqDto,
  ) {
    return this.authServices.bindWallet(req.user.uid, body);
  }

  @Post('bind/twitter')
  @ApiOperation({
    summary: 'Bind Twitter account to user',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async bindTwitter(
    @Req() req: RequestWithUser,
    @Body() body: BindOAuthReqDto,
  ) {
    return this.authServices.bindOAuth(req.user.uid, body, 'twitter');
  }

  @Post('bind/discord')
  @ApiOperation({
    summary: 'Bind Discord account to user',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async bindDiscord(
    @Req() req: RequestWithUser,
    @Body() body: BindOAuthReqDto,
  ) {
    return this.authServices.bindOAuth(req.user.uid, body, 'discord');
  }

  @Post('bind/linkedin')
  @ApiOperation({
    summary: 'Bind LinkedIn account to user',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async bindLinkedIn(
    @Req() req: RequestWithUser,
    @Body() body: BindOAuthReqDto,
  ) {
    return this.authServices.bindOAuth(req.user.uid, body, 'linkedin');
  }
}
