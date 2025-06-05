import { Module } from '@nestjs/common';
import { TotalController } from './controller/total.controller';
import { JwtService } from '@nestjs/jwt';
import { SourceModule } from '@/source/source.module';
import { RankController } from './controller/rank.controller';
import { AdminController } from './controller/admin.controller';

@Module({
  controllers: [TotalController, RankController, AdminController],
  providers: [JwtService],
  exports: [],
  imports: [SourceModule],
})
export class ApiModule {}
