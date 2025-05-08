import { Module } from '@nestjs/common';
import { EcoDataService } from './services/eco.services';
import { DBModule } from '@/db/db.module';

@Module({
  imports: [DBModule],
  providers: [EcoDataService],
  exports: [EcoDataService],
})
export class DataModule {}
