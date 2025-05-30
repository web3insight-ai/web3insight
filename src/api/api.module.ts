import { Module } from '@nestjs/common';
import { TotalController } from './total.controller';
import { JwtService } from '@nestjs/jwt';
import { SourceModule } from '@/source/source.module';
import { RankController } from './rank.controller';
import { AdminController } from './admin.controller';

@Module({
  controllers: [TotalController, RankController, AdminController],
  providers: [JwtService],
  exports: [],
  imports: [SourceModule],
})
export class ApiModule {}
