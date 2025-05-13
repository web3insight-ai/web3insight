import { Provider } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './dto/db.dto';
import type { Octokit as OctokitType } from 'octokit';

export const KYSELY = 'KYSELY';

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
  useFactory: async (): Promise<OctokitType> => {
    // eslint-disable-next-line
    const octokit = new (await import('octokit')).Octokit({ auth: process.env.GITHUB_KEY });
    return octokit;
  },
};
