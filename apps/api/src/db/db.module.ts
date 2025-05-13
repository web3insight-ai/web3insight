import { Module } from '@nestjs/common';
import { kyselyProvider, octokitProvider } from './db.provider';

@Module({
  providers: [kyselyProvider, octokitProvider],
  exports: [kyselyProvider, octokitProvider],
})
export class DBModule {}
