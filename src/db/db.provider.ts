import { Provider } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './dto/db.dto';
import { Octokit } from '@octokit/rest';

export const KYSELY = 'KYSELY_INSTANCE';

export const kyselyProvider: Provider = {
  provide: KYSELY,
  useFactory: () => {
    const dialect = new PostgresDialect({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    });

    return new Kysely<DB>({
      dialect,
    });
  },
};

export const OCTOKIT = 'OCTOKIT_INSTANCE';

export const octokitProvider: Provider = {
  provide: OCTOKIT,
  useFactory: () => {
    const octokit = new Octokit({
      auth: process.env.GITHUB_KEY,
    });
    return octokit;
  },
};
