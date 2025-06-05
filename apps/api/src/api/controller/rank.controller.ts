import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankService } from '@/source/services/rank.services';
import {
  ActorCommitRankListDto,
  EcoRankListDto,
  GetTotalReqDto,
  RepoRankListDto,
} from '../dto/api.dto';
import { EcoType } from '@/source/dto/data.dto';

@Controller()
@ApiTags('Rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Get('ecosystems/top')
  @ApiOperation({
    summary: 'Get ecosystems rank list top 10',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getEcoTop() {
    try {
      const res = await this.rankService.ecoRankTotal(EcoType.ALL);
      return res?.cache_data as EcoRankListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('repos/top')
  @ApiOperation({
    summary: 'Get repos rank list top 10 by star count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoTop(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.rankService.repoStarRank(query.eco_name);
      return res?.cache_data as RepoRankListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('actors/top')
  @ApiOperation({
    summary: 'Get actors rank list top 10',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getActorsTop(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.rankService.getTopCommitActors(query.eco_name);
      return res?.cache_data as ActorCommitRankListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }
}
