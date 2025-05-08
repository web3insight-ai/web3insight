import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../auth/app.auth.guard';

@Controller()
export class AppController {
  @Get()
  @UseGuards(AppAuthGuard)
  async getHello(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return '';
  }
}
