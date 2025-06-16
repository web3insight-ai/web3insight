import { Module } from '@nestjs/common';
import { TotalController } from './controller/total.controller';
import { JwtService } from '@nestjs/jwt';
import { DataModule } from '@/data/data.module';
import { RankController } from './controller/rank.controller';
import { AdminController } from './controller/admin.controller';
import { GithubController } from './controller/github.controller';
import { GithubService } from './services/github.services';
import { DBModule } from '@/db/db.module';

@Module({
  controllers: [
    TotalController,
    RankController,
    AdminController,
    GithubController,
  ],
  providers: [JwtService, GithubService],
  exports: [],
  imports: [DataModule, DBModule],
})
export class ApiModule {}
