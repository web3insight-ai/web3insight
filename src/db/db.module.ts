import { Module } from '@nestjs/common';
import { KYSELY, kyselyProvider } from './db.provider';
import { AppConfigModule } from '@/config/config.module';
import { TokenPoolService } from './pool.services';

@Module({
  imports: [AppConfigModule],
  providers: [kyselyProvider, TokenPoolService],
  exports: [KYSELY, kyselyProvider, TokenPoolService],
})
export class DBModule {}
