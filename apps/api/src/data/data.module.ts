import { Module } from '@nestjs/common';
import { EcoDataService } from './eco.services';
import { SummaryDataService } from './summary.services';
import { DBModule } from '@/app/db/db.module';

@Module({
  imports: [DBModule],
  providers: [EcoDataService, SummaryDataService],
  exports: [EcoDataService, SummaryDataService],
})
export class DataModule {}
