import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetActorsTotalReqDto,
  GetActorDateReqDto,
  GetTotalReqDto,
  TotalDto,
  ActorDateListDto,
  ActorCountryStatListDto,
} from '../dto/api.dto';
import { TotalService } from '@/data/services/total.services';
import { CacheDataService } from '@/data/services/cache.services';
import { CacheKey } from '@/data/dto/cache.dto';
import { ActorsScopeType, ECO_ALL, StatsPeriod } from '@/data/dto/data.dto';

@Controller()
@ApiTags('Total')
export class TotalController {
  constructor(
    private readonly ecoDataService: TotalService,
    private readonly cacheDataService: CacheDataService,
  ) {}

  @Get('repos/total')
  @ApiOperation({
    summary: 'Get total repos count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoNum(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.cacheDataService.getCacheData(
        CacheKey.RepoTotal,
        query.eco_name,
      );
      return res?.cache_data as TotalDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('actors/total')
  @ApiOperation({
    summary: 'Get total actors count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getActorsNum(@Query() query: GetActorsTotalReqDto) {
    try {
      if (query.scope == ActorsScopeType.Core) {
        const res = await this.cacheDataService.getCacheData(
          CacheKey.ActorCoreTotal,
          query.eco_name,
        );
        return res?.cache_data as TotalDto;
      } else {
        const res = await this.cacheDataService.getCacheData(
          CacheKey.ActorTotal,
          query.eco_name,
        );
        return res?.cache_data as TotalDto;
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('actors/total/new/quarter/last')
  @ApiOperation({
    summary: 'Get total new actors count for the last quarter',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getActorsNumQuarter(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.cacheDataService.getCacheData(
        CacheKey.ActorTotalNew,
        query.eco_name,
      );
      return res?.cache_data as TotalDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('ecosystems/total')
  @ApiOperation({
    summary: 'Get ecosystems overview',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getEcoNum() {
    try {
      const res = await this.cacheDataService.getCacheData(
        CacheKey.EcoTotal,
        ECO_ALL,
      );
      return res?.cache_data as TotalDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('actors/total/date')
  @ApiOperation({
    summary:
      'Get actor statistics for the last 8 periods (week/month), excluding current period.',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getActorStats(@Query() query: GetActorDateReqDto) {
    try {
      if (query.period == StatsPeriod.MONTH) {
        const res = await this.cacheDataService.getCacheData(
          CacheKey.ActorMonthTotal,
          query.eco_name,
        );
        return res?.cache_data as ActorDateListDto;
      } else {
        const res = await this.cacheDataService.getCacheData(
          CacheKey.ActorWeekTotal,
          query.eco_name,
        );
        return res?.cache_data as ActorDateListDto;
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e.message, 400);
      }
      throw new HttpException('An unknown error occurred', 500);
    }
  }

  @Get('actors/country/rank')
  @ApiOperation({
    summary: 'Get actor counts by country',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getActorCountryRank() {
    try {
      const res = await this.cacheDataService.getCacheData(
        CacheKey.ActorCountryStats,
        ECO_ALL,
      );
      return res?.cache_data as ActorCountryStatListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e.message, 400);
      }
      throw new HttpException('An unknown error occurred', 500);
    }
  }
}
