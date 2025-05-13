import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetActorsTotalReqDto, GetTotalReqDto, TotalDto } from './api.dto';
import { TotalService } from '@/source/services/total.services';
import { ActorsScopeType, EcoType } from '@/source/dto/data.dto';

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
      const res =
        query.eco_name === EcoType.ALL && query.scope === ActorsScopeType.ALL
          ? await this.ecoDataService.actorsAllTotal(query.eco_name)
          : await this.ecoDataService.actorsCoreTotal(
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
}
