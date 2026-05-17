import { AppAuthGuard, AuthRole, AuthRoles } from '@/auth/app.auth.guard';
import { UsersService } from '@/data/services/users.services';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BaseIdReqAndResDto,
  CustomQueryUsersOrderReqDto,
  CustomQueryUsersReqDto,
  CustomShareReqDto,
} from '../dto/api.dto';
import { RequestWithUser } from '@/auth/auth.jwt.dto';

@Controller()
@ApiTags('Custom')
export class CustomController {
  constructor(private readonly userServices: UsersService) {}

  @Post('custom/analysis/users')
  @ApiOperation({
    summary: 'Post upload users from github url',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async upload(
    @Body() body: CustomQueryUsersReqDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.userServices.uploadAndGetUsers(body, req.user.uid);
  }

  @Post('custom/analysis/users/:id')
  @ApiOperation({
    summary: 'Refresh exists analysis data',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async uploadReload(
    @Body() body: CustomQueryUsersReqDto,
    @Req() req: RequestWithUser,
    @Param() params: BaseIdReqAndResDto,
  ) {
    return await this.userServices.uploadAndGetUsers(
      body,
      req.user.uid,
      String(params.id),
    );
  }

  @Post('custom/analysis/users/:id/delete')
  @ApiOperation({
    summary: 'Remove this id, only my profile',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async remove(
    @Req() req: RequestWithUser,
    @Param() params: BaseIdReqAndResDto,
  ) {
    return await this.userServices.remove(req.user.uid, params);
  }

  @Post('custom/analysis/users/:id/share')
  @ApiOperation({
    summary: 'Switch share status, only my profile',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async share(
    @Req() req: RequestWithUser,
    @Param() params: BaseIdReqAndResDto,
    @Body() body: CustomShareReqDto,
  ) {
    return await this.userServices.share(req.user.uid, params, body);
  }

  @Get('custom/analysis/users')
  @ApiOperation({
    summary: 'Get analysis history list, only for user',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async get(
    @Query() query: CustomQueryUsersOrderReqDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.userServices.getList(query, req.user.uid);
  }

  @Get('custom/analysis/users/public')
  @ApiOperation({
    summary: 'Get analysis public list',
    description: '',
  })
  async getPublic(@Query() query: CustomQueryUsersOrderReqDto) {
    return await this.userServices.getPublicList(query);
  }

  @Get('custom/analysis/users/:id')
  @ApiOperation({
    summary: 'Get data from analysis',
    description: '',
  })
  @AuthRoles(AuthRole.OPTIONAL)
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async analysis(@Param() params: BaseIdReqAndResDto) {
    return await this.userServices.analysisUsers(params);
  }

  @Get('external/users/:username')
  @ApiOperation({
    summary: 'Get data external card, github username',
    description: '',
  })
  async external(@Param('username') username: string) {
    return await this.userServices.getTopFormUserName(username);
  }

  @Get('external/github/users/id/:id')
  @ApiOperation({
    summary: 'Get data external card, github uid',
    description: '',
  })
  @Version('2')
  async external2(@Param('id') uid: string) {
    return await this.userServices.getTopFormUserId(uid);
  }

  @Get('external/github/users/username/:username')
  @ApiOperation({
    summary: 'Get data external card, github username',
    description: '',
  })
  @Version('2')
  async external3(@Param('username') username: string) {
    return await this.userServices.getTopFormGithubUserName(username);
  }

  @Get('event/users/:x')
  @ApiOperation({
    summary: 'Get analysis users by github username or id',
    description: '',
  })
  async eventUsers(@Param('x') identifier: string) {
    return await this.userServices.getEventUsers(identifier);
  }
}
