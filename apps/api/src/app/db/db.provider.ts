import { Provider } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

export const BIGQUERY = 'BIGQUERY';
export const KYSELY = 'KYSELY';

export const bigQueryProvider: Provider = {
  provide: BIGQUERY,
  useFactory: () => {
    return new BigQuery({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  },
};

export const kyselyProvider: Provider = {
  provide: KYSELY,
  useFactory: () => {
    const dialect = new PostgresDialect({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    });

    return new Kysely<Database>({
      dialect,
    });
  },
};

// eslint-disable-next-line
export interface Database {}

// eslint-disable-next-line
export interface UserTable {}

// eslint-disable-next-line
export interface PostTable {}
