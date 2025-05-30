import { AppAuthGuard } from '@/auth/app.auth.guard';
import { RankService } from '@/source/services/rank.services';
import { ReposService } from '@/source/services/repos.services';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BaseIdReqAndResDto,
  ReposCustomMarkReqDto,
  ReposOrderReqDto,
} from './api.dto';

@Controller()
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly _rankService: RankService,
    private readonly reposService: ReposService,
  ) {}

  @Get('admin/ecosystems/repos')
  @ApiOperation({
    summary: 'Get ecosystems repos list',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getReposList(@Query() params: ReposOrderReqDto) {
    return await this.reposService.getReposByEcoName(params);
  }

  @Post('admin/ecosystems/repos/:id/mark')
  @ApiOperation({
    summary: 'Get ecosystems repos list',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async markRepo(
    @Param() params: BaseIdReqAndResDto,
    @Body() body: ReposCustomMarkReqDto,
  ) {
    return await this.reposService.markRepo(params, body);
  }
}
