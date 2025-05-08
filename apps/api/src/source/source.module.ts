import { Module } from '@nestjs/common';
import { InitDataService } from './services/init.services';
import { DBModule } from '@/db/db.module';
import { EcoDataService } from './services/eco.services';
import { CacheDataService } from './services/cache.services';

@Module({
  imports: [DBModule],
  providers: [InitDataService, EcoDataService, CacheDataService],
  exports: [InitDataService],
})
export class DataModule {}
