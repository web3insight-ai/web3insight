import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankService } from '@/data/services/rank.services';
import {
  ActorScoreRankListDto,
  EcoRankListDto,
  GetTotalReqDto,
  RepoRankListDto,
} from '../dto/api.dto';
import { ECO_ALL } from '@/data/dto/data.dto';
import { CacheDataService } from '@/data/services/cache.services';
import { CacheKey } from '@/data/dto/cache.dto';

@Controller()
@ApiTags('Rank')
export class RankController {
  constructor(
    private readonly rankService: RankService,
    private readonly cacheDataService: CacheDataService,
  ) {}

  @Get('ecosystems/top')
  @ApiOperation({
    summary: 'Get ecosystems rank list top 10',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getEcoTop() {
    try {
      const res = await this.rankService.ecoRankTotal(ECO_ALL);
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
      const res = await this.cacheDataService.getCacheData(
        CacheKey.RepoStarRank,
        query.eco_name,
      );
      return res?.cache_data as RepoRankListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('repos/top/7d')
  @ApiOperation({
    summary: 'Get repos rank list top 10 by star count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoTop7d(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.cacheDataService.getCacheData(
        CacheKey.RepoStarRank7d,
        query.eco_name,
      );
      return res?.cache_data as RepoRankListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('repos/top/dev/7d')
  @ApiOperation({
    summary: 'Get repos rank list top 10 by dev count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoTopDev7d(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.cacheDataService.getCacheData(
        CacheKey.RepoDevRank7d,
        query.eco_name,
      );
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
      const res = await this.cacheDataService.getCacheData(
        CacheKey.ActorScoreRank,
        query.eco_name,
      );
      return res?.cache_data as ActorScoreRankListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('years/rank/report')
  @ApiOperation({
    summary: 'Get last year rank report',
    description: '',
  })
  getReport() {
    return {
      years_dev_zh: [
        {
          year: 2021,
          active_dev: 1617,
          growth_percentage: 55.93,
        },
        {
          year: 2022,
          active_dev: 2219,
          growth_percentage: 37.23,
        },
        {
          year: 2023,
          active_dev: 1989,
          growth_percentage: -10.37,
        },
        {
          year: 2024,
          active_dev: 2376,
          growth_percentage: 19.46,
        },
        {
          year: 2025,
          active_dev: 1711,
          growth_percentage: -27.99,
        },
      ],
    };
  }
}
