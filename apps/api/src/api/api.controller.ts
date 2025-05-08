import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetRepoNumReqDto, CountDto } from './api.dto';
import { EcoDataService } from '@/source/services/eco.services';

@Controller('ecosystems')
@ApiTags('General')
export class ApiController {
  constructor(private readonly ecoDataService: EcoDataService) {}

  @Get('repos/total')
  @ApiOperation({
    summary: 'Get a count of all repos in the ecosystem',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoNum(@Query() query: GetRepoNumReqDto) {
    try {
      const res = await this.ecoDataService.reposTotal(query.eco_name);
      return res?.cache_data as CountDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }

  @Get('actors/total')
  @ApiOperation({
    summary: 'Get a count of all actors in the ecosystem',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getAcNum(@Query() query: GetRepoNumReqDto) {
    try {
      const res = await this.ecoDataService.actorsTotal(query.eco_name);
      return res?.cache_data as CountDto;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }
}
