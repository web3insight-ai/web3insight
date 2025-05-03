import { Inject, Injectable } from '@nestjs/common';
import { EcoDataService } from './eco.services';
import { BIGQUERY, KYSELY } from '@/app/db/db.provider';
import { BigQuery } from '@google-cloud/bigquery';
import { Command, Console } from 'nestjs-console';
import { Kysely } from 'kysely';
import { DB } from '@/app/db/dto/db.dto';
import { chunkArray } from '@/app/helper';
import { Contributor } from './data.dto';

@Injectable()
@Console()
export class SummaryDataService {
  @Inject(BIGQUERY)
  private readonly bigquery!: BigQuery;

  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(private readonly ecoDataService: EcoDataService) {}

  @Command({
    command: 'summary:test',
    description: '测试',
  })
  async getCustomRepoUsersActivity(_ecoName: string) {
    const repoNames = this.ecoDataService.getRepoNamesForEco('Starknet');

    const repoCondition = repoNames.map((repo) => `'${repo}'`).join(', ');

    const endTime = new Date('2025-04-24T00:00:00Z');

    const query = `
SELECT
  actor.id AS contributor_id,
  ANY_VALUE(actor.login) AS contributor_login,
  COUNT(*) AS total_count,
  COUNTIF(type = 'PushEvent') AS push_count,
  COUNTIF(type = 'PullRequestEvent') AS pr_count
FROM
  \`githubarchive.month.202*\`
WHERE
  repo.name IN (${repoCondition})
  AND type IN ('PushEvent', 'PullRequestEvent')
  AND created_at < '${endTime.toISOString()}'
GROUP BY
  contributor_id
ORDER BY
  total_count DESC`;

    console.log('Executing query:', query);

    const [data] = (await this.bigquery.query(query)) as [Contributor[]];

    const dbValues = data.map((contributor) => ({
      uid: contributor.contributor_id,
      total_count: contributor.total_count,
      pr_count: contributor.pr_count,
      eco: 'Starknet',
      push_count: contributor.push_count,
      start_time: '2020-01-01T00:00:00Z',
      end_time: '2025-04-24T00:00:00Z',
      created_at: new Date(),
    }));
    for (const chunk of chunkArray(dbValues, 500)) {
      await this.db.insertInto('analysis.eco_event').values(chunk).execute();
    }

    for (const item of data) {
      await this.db
        .insertInto('analysis.github_personal')
        .values({
          id: item.contributor_id,
          login: item.contributor_login,
          updated_at: new Date(),
        })
        .onConflict((oc) =>
          oc
            .column('id')
            .doUpdateSet({
              login: item.contributor_login,
              updated_at: new Date(),
            })
            .where(
              'analysis.github_personal.login',
              '!=',
              item.contributor_login,
            ),
        )
        .execute();
    }
    console.log('Executing query:', data);
  }
}
