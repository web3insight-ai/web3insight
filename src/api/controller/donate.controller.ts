import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonateService } from '@/data/services/donate.services';
import { DonateCreateDto, DonateUpdateDto } from '../dto/donate.dto';
import { RequestWithUser } from '@/auth/auth.jwt.dto';
import { AppAuthGuard } from '@/auth/app.auth.guard';
import { BaseIdReqAndResDto } from '../dto/api.dto';

@Controller()
@ApiTags('Donate')
export class DonateController {
  constructor(private readonly donateService: DonateService) {}

  @Post('donate/repos')
  @ApiOperation({
    summary:
      'Create or update donate repo info, return repo info and donate.json data',
  })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async create(@Body() body: DonateCreateDto, @Req() req: RequestWithUser) {
    return await this.donateService.create(body.repo_full_name, req.user.uid);
  }

  @Get('donate/repos')
  @ApiOperation({ summary: 'List donate repos' })
  async list() {
    return await this.donateService.list();
  }

  @Get('donate/repos/:id')
  @ApiOperation({ summary: 'Get donate repo detail' })
  async detail(@Param() params: BaseIdReqAndResDto) {
    return await this.donateService.detail(params.id);
  }

  @Get('donate/repos/name/:name')
  @ApiOperation({ summary: 'Get donate repo detail by name' })
  async detailByName(@Param('name') name: string) {
    return await this.donateService.detailByName(name);
  }

  @Post('donate/repos/:id')
  @ApiOperation({ summary: 'Update donate repo data' })
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async update(
    @Param() params: BaseIdReqAndResDto,
    @Body() body: DonateUpdateDto,
  ) {
    return await this.donateService.update(params.id, body.repo_donate_data);
  }
}
