import { Module } from '@nestjs/common';
import { InitDataService } from './services/init.services';
import { DBModule } from '@/app/db/db.module';
import { TotalService } from './services/total.services';
import { CacheDataService } from './services/cache.services';
import { RankService } from './services/rank.services';
import { ReposService } from './services/repos.services';
import { UsersService } from './services/users.services';
import { EcoRepoRankService } from './services/eco-repo-rank.services';

@Module({
  imports: [DBModule],
  providers: [
    InitDataService,
    TotalService,
    CacheDataService,
    RankService,
    ReposService,
    UsersService,
    EcoRepoRankService,
  ],
  exports: [
    InitDataService,
    TotalService,
    RankService,
    ReposService,
    CacheDataService,
    UsersService,
    EcoRepoRankService,
  ],
})
export class DataModule {}
