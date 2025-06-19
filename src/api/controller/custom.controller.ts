import { AppAuthGuard } from '@/auth/app.auth.guard';
import { UsersService } from '@/data/services/users.services';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseIdReqAndResDto, CustomQueryUsersReqDto } from '../dto/api.dto';

@Controller()
@ApiTags('Custom')
export class CustomController {
  constructor(private readonly userServices: UsersService) {}

  @Post('custom/analysis/users')
  @ApiOperation({
    summary: 'Get users from github api',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async upload(@Body() body: CustomQueryUsersReqDto) {
    return await this.userServices.uploadAndGetUsers(body);
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
