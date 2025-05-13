import { Module } from '@nestjs/common';
import { InitDataService } from './services/init.services';
import { DBModule } from '@/db/db.module';
import { TotalService } from './services/total.services';
import { CacheDataService } from './services/cache.services';
import { RankService } from './services/rank.services';

@Module({
  imports: [DBModule],
  providers: [InitDataService, TotalService, CacheDataService, RankService],
  exports: [InitDataService, TotalService, RankService],
})
export class SourceModule {}
