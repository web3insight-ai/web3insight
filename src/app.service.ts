import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { BigQueryService } from '@/app/db/bigquery.service';

@Injectable()
@Console()
export class AppService {
  constructor(private readonly bigQueryService: BigQueryService) {}

  @Command({
    command: 'test',
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

    // eslint-disable-next-line
    const rows = await this.bigQueryService.query<any[]>(query);
    console.log('Executing query:', rows);
    return 'Hello World!';
  }
}
