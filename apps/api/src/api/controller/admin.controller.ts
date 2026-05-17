import { AppAuthGuard } from '@/auth/app.auth.guard';
import { RankService } from '@/data/services/rank.services';
import { ReposService } from '@/data/services/repos.services';
import { EcoService } from '@/data/services/eco.services';
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
  EcoList,
  ReposCustomMarkReqDto,
  ReposOrderReqDto,
} from '../dto/api.dto';

@Controller()
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly _rankService: RankService,
    private readonly reposService: ReposService,
    private readonly ecoService: EcoService,
  ) {}

  @Get('admin/ecosystems')
  @ApiOperation({
    summary: 'Get ecosystems repos list',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getEcoSystems(): Promise<EcoList> {
    const ecoFilters = await this.ecoService.getEcoNameFilters();
    return {
      available_ecosystem: ecoFilters,
      provider_ecosystem: ecoFilters,
    };
  }

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

  @Post('admin/test/version')
  @ApiOperation({
    summary: 'Get version test',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  version() {
    return { version: '0.0.20' };
  }
}
