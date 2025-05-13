import { Module } from '@nestjs/common';
import { kyselyProvider } from './db.provider';

@Module({
  providers: [kyselyProvider],
  exports: [kyselyProvider],
})
export class DBModule {}
