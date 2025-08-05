import { AppAuthGuard } from '@/auth/app.auth.guard';
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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BaseIdReqAndResDto,
  CustomQueryUsersOrderReqDto,
  CustomQueryUsersReqDto,
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
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async analysis(@Param() params: BaseIdReqAndResDto) {
    return await this.userServices.analysisUsers(params);
  }
}
