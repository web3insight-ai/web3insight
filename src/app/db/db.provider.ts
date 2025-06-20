import { Provider } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './dto/db.dto';
import * as Cursor from 'pg-cursor';

export const KYSELY = 'KYSELY_INSTANCE';

export const kyselyProvider: Provider = {
  provide: KYSELY,
  useFactory: () => {
    const dialect = new PostgresDialect({
      cursor: Cursor,
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    });

    return new Kysely<DB>({
      dialect,
    });
  },
};
