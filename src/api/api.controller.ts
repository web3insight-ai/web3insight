import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetRepoNumReqDto, TotalDto } from './api.dto';
import { EcoDataService } from '@/source/services/eco.services';

@Controller()
@ApiTags('General')
export class ApiController {
  constructor(private readonly ecoDataService: EcoDataService) {}

  @Get('repos/total')
  @ApiOperation({
    summary: 'Get total repos count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoNum(@Query() query: GetRepoNumReqDto) {
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
  async getAcNum(@Query() query: GetRepoNumReqDto) {
    try {
      const res = await this.ecoDataService.actorsTotal(query.eco_name);
      return res?.cache_data as TotalDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('ecosystems/total')
  @ApiOperation({
    summary: 'Get number of ecosystems',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getEcoNum(@Query() query: GetRepoNumReqDto) {
    try {
      const res = await this.ecoDataService.actorsTotal(query.eco_name);
      return res?.cache_data as TotalDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('ecosystems')
  @ApiOperation({
    summary: 'Get list of ecosystem names',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getEcoList(@Query() query: GetRepoNumReqDto) {
    try {
      const res = await this.ecoDataService.actorsTotal(query.eco_name);
      return res?.cache_data as TotalDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }
}
