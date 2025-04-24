import { Module } from '@nestjs/common';
import { bigQueryProvider, kyselyProvider } from './db.provider';

@Module({
  providers: [bigQueryProvider, kyselyProvider],
  exports: [bigQueryProvider, kyselyProvider],
})
export class DBModule {}
