import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankService } from '@/source/services/rank.services';
import { EcoRankListDto, GetTotalReqDto } from './api.dto';

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
  async getEcoTop(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.rankService.EcoRankTotal(query.eco_name);
      return res?.cache_data as EcoRankListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('repos/top')
  @ApiOperation({
    summary: 'Get repos rank list top 10',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoNum(@Query() _query: GetTotalReqDto) {
    try {
      return Promise.resolve();
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }
}
