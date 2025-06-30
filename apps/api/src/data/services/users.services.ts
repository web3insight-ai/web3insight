import {
  BaseIdReqAndResDto,
  CustomQueryUsersOrderReqDto,
  CustomQueryUsersReqDto,
  CustomQueryUsersResDto,
  CustomUploadResDto,
  GithubUsersDto,
  Intent,
} from '@/api/dto/api.dto';
import { KYSELY } from '@/app/db/db.provider';
import { ApiAnalysisUsers, DB } from '@/app/db/dto/db.dto';
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

      const batchResults = await Promise.all(
        batch.map(async (username) => {
          try {
            const clinet = await this.tokenPoolService.getClient();
            const response = await clinet.users.getByUsername({ username });
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
        submitter_id: body.submitter_id,
        description: body.description,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.id = Number(id.id);

    return res;
  }

  async getList(params: CustomQueryUsersOrderReqDto) {
    let query = this.db
      .selectFrom('api.analysis_users')
      .where('submitter_id', '=', params.submitter_id);

    const total = await query
      .select(this.db.fn.count('id').as('total'))
      .execute();

    query = query.orderBy('id', params.direction);
    query = query.offset(params.skip);
    query = query.limit(params.take);

    const find = await query
      .select(['id', 'description', 'created_at'])
      .execute();

    const res = new CustomQueryUsersResDto();
    res.list = find as unknown as ApiAnalysisUsers[];
    res.total = total[0].total as number;

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
      return analysis;
    }

    const sqlRawQuery = `
WITH user_ids AS (SELECT UNNEST($1::bigint[]) AS actor_id),
     repo_base_scores AS (SELECT e.actor_id,
                                 e.repo_id,
                                 r.repo_name,
                                 MAX(CASE WHEN e.event_type = 'PushEvent' THEN 1 ELSE 0 END)          AS has_commit,
                                 COUNT(CASE WHEN e.event_type = 'PullRequestEvent' THEN 1 ELSE 0 END) AS pr_count,
                                 MIN(e.created_at)                                                    AS first_activity_at,
                                 MAX(e.created_at)                                                    AS last_activity_at
                          FROM data.events e
                                   JOIN data.repos r ON e.repo_id = r.repo_id
                                   JOIN user_ids u ON e.actor_id = u.actor_id
                          WHERE e.event_type IN ('PushEvent', 'PullRequestEvent')
                          GROUP BY e.actor_id, e.repo_id, r.repo_name),
     repo_scores AS (SELECT actor_id,
                            repo_id,
                            repo_name,
                            has_commit * 1 + pr_count * 2 AS total_score,
                            first_activity_at,
                            last_activity_at
                     FROM repo_base_scores),
     repo_ecosystems AS (SELECT DISTINCT ON (r.repo_id, ecosystem_key) r.repo_id,
                                                                       jsonb_object_keys(r.upstream_marks) AS ecosystem_key
                         FROM data.repos r
                                  JOIN repo_scores rs ON r.repo_id = rs.repo_id
                         WHERE r.upstream_marks != '{}'::jsonb),
     repo_ecosystem_scores AS (SELECT rs.actor_id,
                                      rs.repo_name,
                                      re.ecosystem_key,
                                      rs.total_score,
                                      rs.first_activity_at,
                                      rs.last_activity_at
                               FROM repo_scores rs
                                        JOIN repo_ecosystems re ON rs.repo_id = re.repo_id
                               WHERE rs.total_score > 0),
     unique_ecosystem_repos AS (SELECT DISTINCT actor_id,
                                                ecosystem_key,
                                                repo_name,
                                                total_score,
                                                first_activity_at,
                                                last_activity_at
                                FROM repo_ecosystem_scores),
     ecosystem_repos AS (SELECT actor_id,
                                ecosystem_key,
                                jsonb_agg(
                                        jsonb_build_object(
                                                'repo_name', repo_name,
                                                'score', total_score,
                                                'first_activity_at', first_activity_at,
                                                'last_activity_at', last_activity_at
                                        )
                                        ORDER BY total_score DESC
                                )                      AS repo_details,
                                SUM(total_score)       AS ecosystem_total_score,
                                MIN(first_activity_at) AS ecosystem_first_activity_at,
                                MAX(last_activity_at)  AS ecosystem_last_activity_at
                         FROM unique_ecosystem_repos
                         GROUP BY actor_id, ecosystem_key)
SELECT u.actor_id,
       COALESCE(
               (SELECT jsonb_agg(
                               jsonb_build_object(
                                       'ecosystem', ecosystem_key,
                                       'repos', repo_details,
                                       'total_score', ecosystem_total_score,
                                       'first_activity_at', ecosystem_first_activity_at,
                                       'last_activity_at', ecosystem_last_activity_at
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
        })
        .returningAll();
      const exec = await this.db.executeQuery(update);
      return { users: exec.rows[0] };
    }
    return { users: [] };
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
    data.submitter_id = 'user_id';
    const res = await this.uploadAndGetUsers(data);

    const id = new BaseIdReqAndResDto();
    id.id = res.id;

    await this.analysisUsers(id);
  }
}
