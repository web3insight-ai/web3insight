import { Module } from '@nestjs/common';
import { ApiController } from './total.controller';
import { JwtService } from '@nestjs/jwt';
import { SourceModule } from '@/source/source.module';

@Module({
  controllers: [ApiController],
  providers: [JwtService],
  exports: [],
  imports: [SourceModule],
})
export class ApiModule {}
