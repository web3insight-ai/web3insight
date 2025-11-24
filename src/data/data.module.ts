import { Module } from '@nestjs/common';
import { InitDataService } from './services/init.services';
import { DBModule } from '@/app/db/db.module';
import { TotalService } from './services/total.services';
import { CacheDataService } from './services/cache.services';
import { RankService } from './services/rank.services';
import { ReposService } from './services/repos.services';
import { UsersService } from './services/users.services';
import { EcoService } from './services/eco.services';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DBModule, AuthModule],
  providers: [
    InitDataService,
    TotalService,
    CacheDataService,
    RankService,
    ReposService,
    UsersService,
    EcoService,
  ],
  exports: [
    InitDataService,
    TotalService,
    RankService,
    ReposService,
    CacheDataService,
    UsersService,
    EcoService,
  ],
})
export class DataModule {}
