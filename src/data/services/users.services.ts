import {
  BaseIdReqAndResDto,
  CustomQueryUsersReqDto,
  CustomUploadResDto,
  GithubUsersDto,
  Intent,
} from '@/api/dto/api.dto';
import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { TokenPoolService } from '@/app/db/pool.services';
import { Inject, Injectable } from '@nestjs/common';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';

@Injectable()
@Console()
export class UsersService {
  constructor(
    @Inject(KYSELY) private readonly db: Kysely<DB>,
    private readonly tokenPoolService: TokenPoolService,
  ) {}

  async uploadAndGetUsers(body: CustomQueryUsersReqDto) {
    const usernames = body.request_data
      .map((url) => this.extractUsername(url))
      .filter((username): username is string => username !== null);

    const githubData = [] as GithubUsersDto[];

    for (let i = 0; i < usernames.length; i += 10) {
      const batch = usernames.slice(i, i + 10);

      const octokit = this.tokenPoolService.getClient();

      const batchResults = await Promise.all(
        batch.map(async (username) => {
          try {
            const response = await octokit.users.getByUsername({ username });
            return { username, data: response.data };
          } catch (error) {
            console.error(`Failed to process user ${username}:`, error);
            return null;
          }
        }),
      );

      batchResults.forEach((result) => {
        if (result) {
          githubData.push(result.data);
        }
      });
    }

    const res = new CustomUploadResDto();
    res.users = githubData;

    const id = await this.db
      .insertInto('api.analysis_users')
      .values({
        request_data: { urls: body.request_data },
        github: JSON.stringify({ users: githubData }),
        intent: body.intent,
        submitter_email: body.submitter_email,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.id = Number(id.id);

    return res;
  }

  async analysisUsers(params: BaseIdReqAndResDto) {
    const analysis = await this.db
      .selectFrom('api.analysis_users')
      .selectAll()
      .where('id', '=', String(params.id))
      .executeTakeFirstOrThrow();

    if (!analysis) {
      throw new Error('Analysis not found');
    }

    if (analysis.data && Object.keys(analysis.data).length > 0) {
      return analysis.data;
    }

    const sqlRawQuery = `
WITH user_ids AS (SELECT UNNEST($1::bigint[]) AS actor_id),

     repo_base_scores AS (SELECT e.actor_id,
                                 e.repo_id,
                                 r.repo_name,
                                 MAX(CASE WHEN e.event_type = 'PushEvent' THEN 1 ELSE 0 END)          AS has_commit,
                                 COUNT(CASE WHEN e.event_type = 'PullRequestEvent' THEN 1 ELSE 0 END) AS pr_count
                          FROM web3.event e
                                   JOIN web3.repos r ON e.repo_id = r.repo_id
                                   JOIN user_ids u ON e.actor_id = u.actor_id
                          WHERE e.event_type IN ('PushEvent', 'PullRequestEvent')
                          GROUP BY e.actor_id, e.repo_id, r.repo_name),


     repo_scores AS (SELECT actor_id,
                            repo_id,
                            repo_name,
                            has_commit * 1 + pr_count * 2 AS total_score
                     FROM repo_base_scores),


     repo_ecosystems AS (SELECT r.repo_id,
                                jsonb_object_keys(r.upstream_marks) AS ecosystem_key
                         FROM web3.repos r
                                  JOIN repo_scores rs ON r.repo_id = rs.repo_id
                         WHERE r.upstream_marks != '{}'::jsonb),


     repo_ecosystem_scores AS (SELECT rs.actor_id,
                                      rs.repo_name,
                                      re.ecosystem_key,
                                      rs.total_score
                               FROM repo_scores rs
                                        JOIN repo_ecosystems re ON rs.repo_id = re.repo_id
                               WHERE rs.total_score > 0),


     ecosystem_repos AS (SELECT actor_id,
                                ecosystem_key,
                                jsonb_agg(
                                        jsonb_build_object(repo_name, total_score)
                                        ORDER BY total_score DESC
                                )                AS repo_scores,
                                SUM(total_score) AS ecosystem_total_score
                         FROM repo_ecosystem_scores
                         GROUP BY actor_id, ecosystem_key)


SELECT u.actor_id,
       COALESCE(
               (SELECT jsonb_agg(
                               jsonb_build_object(
                                       'ecosystem', ecosystem_key,
                                       'repos', repo_scores,
                                       'total_score', ecosystem_total_score
                               )
                               ORDER BY ecosystem_total_score DESC
                       )
                FROM ecosystem_repos er
                WHERE er.actor_id = u.actor_id),
               '[]'::jsonb
       ) AS ecosystem_scores
FROM user_ids u;`;

    const ids = (analysis.github as unknown as CustomUploadResDto).users.map(
      (user) => user.id,
    );
    const query = CompiledQuery.raw(sqlRawQuery, [ids]);
    const results = await this.db.executeQuery(query);

    if (results.rows.length > 0) {
      const update = this.db
        .updateTable('api.analysis_users')
        .where('id', '=', analysis.id)
        .set({
          data: JSON.stringify({ users: results.rows }),
        });
      await this.db.executeQuery(update);
    }
    return { users: results.rows };
  }

  private extractUsername(url: string): string | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'github.com') {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 1) {
          return pathParts[0];
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  @Command({
    command: 'test:users:fn',
    description: '',
  })
  async test() {
    const urls = ['https://github.com/zhang-wenchao'];
    const data = new CustomQueryUsersReqDto();
    data.request_data = urls;
    data.intent = Intent.Hackathon;
    data.submitter_email = 'test@example.com';
    const res = await this.uploadAndGetUsers(data);

    const id = new BaseIdReqAndResDto();
    id.id = res.id;

    await this.analysisUsers(id);
  }
}
