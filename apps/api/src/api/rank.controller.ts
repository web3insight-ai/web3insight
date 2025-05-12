import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EcoDataService } from '@/source/services/total.services';

@Controller()
@ApiTags('Rank')
export class RankController {
  constructor(private readonly ecoDataService: EcoDataService) {}

  @Get('ecosystems/top')
  @ApiOperation({
    summary: 'Get ecosystems rank list top 10',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getEcoTop() {
    try {
      return Promise.resolve();
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }
}
