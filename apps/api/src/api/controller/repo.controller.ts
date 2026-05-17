import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppAuthGuard } from '../../auth/app.auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetRepoInfoDto } from '../dto/api.dto';
import { ReposService } from '@/data/services/repos.services';

@Controller()
@ApiTags('Repo')
export class RepoController {
  constructor(private readonly reposService: ReposService) {}

  @Get('repos/active/developer')
  @ApiOperation({
    summary: 'Get total repos count',
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getRepoActiveDeveloper(@Query() query: GetRepoInfoDto) {
    try {
      const res = await this.reposService.getRepoActiveDevelopers(
        query.repo_id,
      );
      return res;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e, 400);
      }
    }
  }
}
