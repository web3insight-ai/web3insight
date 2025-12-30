import { Module, forwardRef } from '@nestjs/common';
import { InitDataService } from './services/init.services';
import { DBModule } from '@/app/db/db.module';
import { TotalService } from './services/total.services';
import { CacheDataService } from './services/cache.services';
import { RankService } from './services/rank.services';
import { ReposService } from './services/repos.services';
import { UsersService } from './services/users.services';
import { EcoService } from './services/eco.services';
import { AuthModule } from '@/auth/auth.module';
import { DonateService } from './services/donate.services';
import { GithubService } from '@/api/services/github.services';

@Module({
  imports: [DBModule, forwardRef(() => AuthModule)],
  providers: [
    InitDataService,
    TotalService,
    CacheDataService,
    RankService,
    ReposService,
    UsersService,
    EcoService,
    DonateService,
    GithubService,
  ],
  exports: [
    InitDataService,
    TotalService,
    RankService,
    ReposService,
    CacheDataService,
    UsersService,
    EcoService,
    DonateService,
    GithubService,
  ],
})
export class DataModule {}
