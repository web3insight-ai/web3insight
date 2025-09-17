import {
  BaseIdReqAndResDto,
  CustomQueryUsersOrderReqDto,
  CustomQueryUsersReqDto,
  CustomQueryUsersResDto,
  CustomShareReqDto,
  CustomUploadResDto,
  GithubUsersDto,
  Intent,
} from '@/api/dto/api.dto';
import { KYSELY } from '@/app/db/db.provider';
import { ApiAnalysisUsers, DB } from '@/app/db/dto/db.dto';
import { TokenPoolService } from '@/app/db/pool.services';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';

@Injectable()
@Console()
export class UsersService {
  constructor(
    @Inject(KYSELY) private readonly db: Kysely<DB>,
    private readonly tokenPoolService: TokenPoolService,
    private eventEmitter: EventEmitter2,
  ) {}

  async uploadAndGetUsers(
    body: CustomQueryUsersReqDto,
    uid: string,
    ref: string = '',
  ) {
    let usernames = body.request_data.map((url) => this.extractUsername(url));

    if (body.intent === Intent.Profile) {
      const existing = await this.db
        .selectFrom('api.analysis_users')
        .select(['id', 'github', 'public', 'submitter_id'])
        .where('submitter_id', '=', uid)
        .where('intent', '=', body.intent)
        .executeTakeFirst();

      if (existing) {
        const res = new CustomUploadResDto();
        res.users = existing.github as any[];
        res.id = Number(existing.id);
        return res;
      }

      const githubName = await this.db
        .selectFrom('api.auth_users_binds')
        .select(['bind_key', 'bind_uid', 'bind_id'])
        .where('bind_uid', '=', uid)
        .where('bind_type', '=', 'github')
        .executeTakeFirst();

      if (githubName) {
        usernames = [];
        usernames.push(githubName.bind_key);
      }
    }

    const githubData = [] as GithubUsersDto[];

    const fail = [] as string[];

    for (let i = 0; i < usernames.length; i += 10) {
      const batch = usernames.slice(i, i + 10);

      const batchResults = await Promise.all(
        batch.map(async (username) => {
          try {
            if (!username) {
              fail.push(username);
              return null;
            }
            const clinet = await this.tokenPoolService.getClient();
            const response = await clinet.users.getByUsername({ username });
            return { username, data: response.data };
          } catch (error) {
            fail.push(username);
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
    res.fail = fail;

    if (ref === '') {
      const id = await this.db
        .insertInto('api.analysis_users')
        .values({
          request_data: { urls: body.request_data },
          github: JSON.stringify({ users: githubData }),
          intent: body.intent,
          submitter_id: uid,
          description: body.description,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      res.id = Number(id.id);
    } else {
      res.id = Number(ref);
      await this.db
        .updateTable('api.analysis_users')
        .set({
          request_data: { urls: body.request_data },
          github: JSON.stringify({ users: githubData }),
          intent: body.intent,
          description: body.description,
          data: JSON.stringify({}),
          ai: JSON.stringify({}),
        })
        .where('id', '=', String(ref))
        .execute();
    }

    this.eventEmitter.emit('api.custom.analysis.created', res);

    return res;
  }

  async share(
    uid: string,
    params: BaseIdReqAndResDto,
    body: CustomShareReqDto,
  ) {
    const existing = await this.db
      .selectFrom('api.analysis_users')
      .select(['id', 'public'])
      .where('submitter_id', '=', uid)
      .where('intent', '=', Intent.Profile)
      .where('id', '=', String(params.id))
      .executeTakeFirst();

    if (!existing) {
      throw new Error('Analysis not found');
    }

    await this.db
      .updateTable('api.analysis_users')
      .where('id', '=', String(params.id))
      .set({
        public: body.share,
      })
      .execute();

    return new Object();
  }

  async remove(uid: string, params: BaseIdReqAndResDto) {
    const existing = await this.db
      .selectFrom('api.analysis_users')
      .select(['id'])
      .where('submitter_id', '=', uid)
      .where('intent', '=', Intent.Profile)
      .where('id', '=', String(params.id))
      .executeTakeFirst();

    if (!existing) {
      throw new Error('Analysis not found');
    }

    await this.db
      .deleteFrom('api.analysis_users')
      .where('id', '=', String(params.id))
      .execute();

    return new Object();
  }

  async getList(params: CustomQueryUsersOrderReqDto, uid: string) {
    let query = this.db
      .selectFrom('api.analysis_users')
      .where('submitter_id', '=', uid)
      .where('intent', '=', params.intent);

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

  async getPublicList(params: CustomQueryUsersOrderReqDto) {
    let query = this.db
      .selectFrom('api.analysis_users')
      .where('public', '=', true)
      .where('intent', '=', 'hackathon');

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
    return analysis;
  }

  private extractUsername(input: string): string | null {
    const s = input.trim();
    if (!s) return null;

    if (!s.includes('/') && !s.startsWith('@')) return s;

    if (s.startsWith('@')) return s.slice(1) || null;

    try {
      const url = new URL(s.includes('://') ? s : 'https://' + s);
      if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
        const p = url.pathname.split('/')[1];
        return p || null;
      }
    } catch {
      /* ignore */
    }

    return s;
  }

  @OnEvent('api.custom.analysis.created', { async: true })
  async handleOrderCreatedEvent(payload: CustomUploadResDto) {
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

    const ids = payload.users.map((user: { id: any }) => user.id);
    const query = CompiledQuery.raw(sqlRawQuery, [ids]);
    const results = await this.db.executeQuery(query);

    const ecosystems = results.rows.flatMap((item: any) => {
      return item.ecosystem_scores.map((ecosystem: any) => ecosystem.ecosystem);
    });

    const uniqueEcosystems = Array.from(new Set(ecosystems));

    let rows = results.rows;

    if (uniqueEcosystems.length > 0) {
      const ecosystemDB = await this.db
        .selectFrom('data.ecosystems')
        .where('name', 'in', uniqueEcosystems)
        .selectAll()
        .execute();

      rows = results.rows.filter((item: any) => {
        item.ecosystem_scores = item.ecosystem_scores.filter(
          (ecosystem: any) => {
            const dbEcosystem = ecosystemDB.find(
              (dbItem) => dbItem.name === ecosystem.ecosystem,
            );
            return dbEcosystem && dbEcosystem.active;
          },
        );
        return true;
      });

      rows.sort((a: any, b: any) => {
        const scoreA = a.ecosystem_scores.reduce(
          (s: any, e: { total_score: any }) => s + e.total_score,
          0,
        );
        const scoreB = b.ecosystem_scores.reduce(
          (s: any, e: { total_score: any }) => s + e.total_score,
          0,
        );
        return scoreB - scoreA;
      });
    }

    const data: any = { users: rows };

    const totalUsers = data.users.length;

    const usersWithContributions = data.users.filter(
      (user: any) => user.ecosystem_scores && user.ecosystem_scores.length > 0,
    ).length;

    const usersWithoutContributions = totalUsers - usersWithContributions;

    const contributionPercentage = (usersWithContributions / totalUsers) * 100;

    const ecosystemCounts: { [key: string]: number } = {};

    data.users.forEach((user: any) => {
      if (user.ecosystem_scores) {
        user.ecosystem_scores.forEach((ecosystem) => {
          if (ecosystem.ecosystem) {
            ecosystemCounts[ecosystem.ecosystem] =
              (ecosystemCounts[ecosystem.ecosystem] || 0) + 1;
          }
        });
      }
    });

    const ecosystemRanking = Object.entries(ecosystemCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([ecosystem, count]) => ({ ecosystem, count }));

    data.users_with_contributions = usersWithContributions;
    data.users_without_contributions = usersWithoutContributions;
    data.contribution_percentage = contributionPercentage;
    data.ecosystem_ranking = ecosystemRanking;

    const body = JSON.stringify(data);

    if (rows.length > 0) {
      const update = this.db
        .updateTable('api.analysis_users')
        .where('id', '=', String(payload.id))
        .set({
          data: body,
        })
        .returningAll();
      await this.db.executeQuery(update);
    }

    if (ids.length > 1) {
      return;
    }

    const newData = await this.db
      .selectFrom('api.analysis_users')
      .selectAll()
      .where('id', '=', String(payload.id))
      .executeTakeFirstOrThrow();

    const ai = await fetch(
      'https://n8n.pseudoyu.com/webhook/developer/profile',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      },
    );

    const aiData = await ai.json();

    const update = this.db
      .updateTable('api.analysis_users')
      .where('id', '=', String(payload.id))
      .set({
        ai: JSON.stringify(aiData),
      })
      .returningAll();
    await this.db.executeQuery(update);
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
    const res = await this.uploadAndGetUsers(data, '2');

    const id = new BaseIdReqAndResDto();
    id.id = res.id;

    await this.analysisUsers(id);
  }
}
