import { Inject, Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { BIGQUERY, KYSELY } from './app/db/db.provider';
import { BigQuery } from '@google-cloud/bigquery';
import { CompiledQuery, Kysely } from 'kysely';
import { DB } from './app/db/dto/db.dto';

@Injectable()
@Console()
export class AppService {
  @Inject(BIGQUERY)
  private readonly bigquery!: BigQuery;

  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  @Command({
    command: 'app:test',
    description: '测试',
  })
  async getHello(): Promise<string> {
    const query = `
SELECT
  actor.login AS contributor_name,
  COUNT(*) AS total_contribution_count,
  COUNTIF(type = 'PushEvent') AS push_count,
  COUNTIF(type = 'PullRequestEvent') AS pr_count
FROM
  \`githubarchive.day.20250402\`
WHERE
  org.login = 'starknet-io'
  AND type IN ('PushEvent', 'PullRequestEvent')
GROUP BY
  contributor_name
ORDER BY
  total_contribution_count DESC`;

    const [data] = await this.bigquery.query(query);
    console.log('Executing query:', data);

    const { rows } = await this.db.executeQuery<{ moshe: 1 }>(
      CompiledQuery.raw('select 1 as moshe', []),
    );

    console.log('数据库连接成功:', rows);

    console.log('✅ 数据库连接成功');

    return 'Hello World!';
  }
}
