import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GithubService } from '../services/github.services';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppAuthGuard } from '@/auth/app.auth.guard';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('proxy/*path')
  @ApiBearerAuth()
  @UseGuards(AppAuthGuard)
  async getGitHub(@Req() req: Request) {
    return this.githubService.get(req);
  }
}
