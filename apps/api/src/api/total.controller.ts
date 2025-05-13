import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetActorsTotalReqDto,
  GetActorDateReqDto,
  GetTotalReqDto,
  TotalDto,
  ActorDateListDto,
} from './api.dto';
import { TotalService } from '@/source/services/total.services';

@Controller()
@ApiTags('Total')
export class TotalController {
  constructor(private readonly ecoDataService: TotalService) {}

  @Get('repos/total')
  @ApiOperation({
    summary: 'Get total repos count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoNum(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.ecoDataService.reposTotal(query.eco_name);
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
  async getAcNum(@Query() query: GetActorsTotalReqDto) {
    try {
      const res = await this.ecoDataService.actorsTotal(
        query.eco_name,
        query.scope,
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
  async getEcoNum(@Query() query: GetTotalReqDto) {
    try {
      const res = await this.ecoDataService.ecoTotal(query.eco_name);
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
      const res = await this.ecoDataService.getActorStats(
        query.eco_name,
        query.period,
      );
      return res?.cache_data as ActorDateListDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e.message, 400);
      }
      throw new HttpException('An unknown error occurred', 500);
    }
  }
}
