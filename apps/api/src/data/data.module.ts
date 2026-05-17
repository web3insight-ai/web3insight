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
import { YearsService } from './services/years.services';
import { AIModule } from '@/ai/ai.module';

@Module({
  imports: [DBModule, forwardRef(() => AuthModule), AIModule],
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
    YearsService,
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
    YearsService,
  ],
})
export class DataModule {}
