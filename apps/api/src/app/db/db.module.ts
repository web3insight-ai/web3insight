import { Module } from '@nestjs/common';
import { BigQueryService } from '@/app/db/bigquery.service';

@Module({
  providers: [BigQueryService],
  exports: [BigQueryService],
})
export class DBModule {}
