import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AppAuthGuard } from './app/auth/app.auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(AppAuthGuard)
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }
}
