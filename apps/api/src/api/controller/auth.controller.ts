import { AuthService } from '@/auth/services/auth.services';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  AuthBindWalletReqDto,
  LoginReqDto,
  OpenBuildBindReqDto,
  PrivyReqDto,
  UpdateUserExtraReqDto,
  UpdateUserReqDto,
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

  @Get('user/info/:tag/extra')
  @ApiOperation({
    summary: 'Get user extra profile by user_info_type',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getUserExtra(@Req() req: RequestWithUser, @Param('tag') tag: string) {
    return this.authServices.getUserExtra(req.user, tag);
  }

  @Post('user/info/:tag/extra')
  @ApiOperation({
    summary: 'Update user extra profile by user_info_type',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async updateUserExtra(
    @Param('tag') tag: string,
    @Req() req: RequestWithUser,
    @Body() body: UpdateUserExtraReqDto,
  ) {
    return this.authServices.updateUserExtra(req.user, tag, body);
  }

  @Get('user/public/:id')
  @ApiOperation({
    summary: 'Get user public profile',
    description: '',
  })
  async getUserId(@Param('id') id: string) {
    return this.authServices.getUserInfoFormId(id);
  }

  @Post('user/info/:tag')
  @ApiOperation({
    summary:
      'Update user profile, tag is custom event like monad_20251011/mantle_2025',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  @Version('2')
  async updateUserV2(
    @Param('tag') tag: string,
    @Req() req: RequestWithUser,
    @Body() body: UpdateUserReqDto,
  ) {
    return this.authServices.updateUserInfoV2(req.user, body, tag);
  }

  @Get('user/info/:tag/:id')
  @Version('2')
  @ApiOperation({
    summary:
      'Get user public profile, tag is custom event like monad_20251011/mantle_2025',
    description: '',
  })
  async getUserIdV2(@Param('id') id: string, @Param('tag') tag: string) {
    return this.authServices.getUserInfoFormIdV2(id, tag);
  }

  @Post('user')
  @ApiOperation({
    summary: 'Update user profile',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async updateUser(
    @Req() req: RequestWithUser,
    @Body() body: UpdateUserReqDto,
  ) {
    return this.authServices.updateUserInfo(req.user, body);
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

  @Post('privy/token/auth')
  @ApiOperation({
    summary: 'Post privy token ',
    description: '',
  })
  async privyTokenAuth(@Body() body: PrivyReqDto) {
    return this.authServices.privyTokenAuth(body.id_token);
  }

  @Post('bind/openbuild')
  @ApiOperation({
    summary: 'Bind openbuild oauth',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async bindOpenBuild(
    @Req() req: RequestWithUser,
    @Body() body: OpenBuildBindReqDto,
  ) {
    return this.authServices.bindOpenBuildOAuth(req.user.uid, body.code);
  }

  @Get('openbuild/record')
  @ApiOperation({
    summary: 'Get openbuild user record',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getOpenBuildRecord(@Req() req: RequestWithUser) {
    return this.authServices.getOpenBuildUserRecord(req.user.uid);
  }
}
