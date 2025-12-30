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
import { AuthService } from '@/auth/services/auth.services';
import { GithubService } from '@/api/services/github.services';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';

@Injectable()
@Console()
export class UsersService {
  constructor(
    @Inject(KYSELY) private readonly db: Kysely<DB>,
    private readonly tokenPoolService: TokenPoolService,
    private readonly githubService: GithubService,
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async uploadAndGetUsers(
    body: CustomQueryUsersReqDto,
    uid: string,
    ref: string = '',
  ) {
    const usernames = body.request_data.map((url) =>
      this.githubService.extractUsername(url),
    );

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

      const githubUsername = await this.getPrivyGithubUsername(uid);
      if (githubUsername) {
        usernames.push(githubUsername);
      }

      if (usernames.length === 0) {
        throw new Error('No GitHub usernames provided or linked');
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

  async getTopFormUserName(username: string) {
    const analysis = await this.db
      .selectFrom('api.analysis_users')
      .select(['data', 'github'])
      .where('intent', '=', Intent.Profile)
      .where('data', '!=', '{}')
      .where(
        'github',
        '@>',
        JSON.stringify({
          users: [{ login: username }],
        }),
      )
      .executeTakeFirst();

    if (!analysis) {
      return {
        username,
        top_ecosystems: [],
        message: 'User not found',
      };
    }

    const githubData = analysis.github as any;
    const githubUser = githubData.users.find(
      (u: any) => u.login && u.login.toLowerCase() === username.toLowerCase(),
    );

    if (!githubUser) {
      return {
        username,
        top_ecosystems: [],
        message: 'User not found in github data',
      };
    }

    const data = analysis.data as any;
    const userEcosystemData = data.users?.find(
      (u: any) =>
        u.actor_id === githubUser.id.toString() ||
        Number(u.actor_id) === githubUser.id,
    );

    if (!userEcosystemData || !userEcosystemData.ecosystem_scores) {
      return {
        username,
        actor_id: githubUser.id,
        top_ecosystems: [],
        message: 'No ecosystem data found for user',
      };
    }

    const topEcosystems = userEcosystemData.ecosystem_scores
      .sort((a: any, b: any) => b.total_score - a.total_score)
      .slice(0, 3)
      .map((ecosystem: any) => ({
        ecosystem: ecosystem.ecosystem,
        score: ecosystem.total_score,
        repos_count: ecosystem.repos ? ecosystem.repos.length : 0,
        first_activity_at: ecosystem.first_activity_at,
        last_activity_at: ecosystem.last_activity_at,
      }));

    return {
      username,
      actor_id: githubUser.id,
      top_ecosystems: topEcosystems,
      total_ecosystems: userEcosystemData.ecosystem_scores.length,
    };
  }

  async getTopFormUserId(id: string) {
    const analysis = await this.db
      .selectFrom('data.actors')
      .select(['eco_score', 'actor_id', 'actor_login'])
      .where('actor_id', '=', id)
      .executeTakeFirst();
    if (!analysis) {
      return {};
    }

    const ecoScore = (analysis.eco_score || {}) as any;
    const allEcosystems = Array.isArray(ecoScore.ecosystems)
      ? ecoScore.ecosystems
      : [];

    const ecosystemNames = allEcosystems
      .map((ecosystem: any) => ecosystem?.ecosystem?.trim())
      .filter((name: string | undefined | null): name is string => !!name);

    const activeNames = await this.getActiveEcosystemNames(ecosystemNames);
    const activeNameSet = new Set(activeNames);

    const ecosystems = allEcosystems.filter((ecosystem: any) => {
      const name = ecosystem?.ecosystem?.trim();
      return name && activeNameSet.has(name);
    });

    return {
      ...analysis,
      eco_score: {
        ...ecoScore,
        ecosystems,
      },
    };
  }

  async getTopFormGithubUserName(username: string) {
    const clinet = await this.tokenPoolService.getClient();
    const response = await clinet.users.getByUsername({ username });
    return await this.getTopFormUserId(response.data.id.toString());
  }

  async getEventUsers(identifier: string) {
    const rawIdentifier = identifier?.trim();
    if (!rawIdentifier) {
      throw new Error('identifier is required');
    }

    const normalizedIdentifier =
      this.githubService.extractUsername(rawIdentifier) ?? rawIdentifier;
    const isGithubId = /^\d+$/.test(normalizedIdentifier);
    const match = isGithubId
      ? { id: Number(normalizedIdentifier) }
      : { login: normalizedIdentifier };
    const conditions = [{ users: [match] }, [match]];

    const results = new Map<string, { id: number; description: string }>();

    for (const condition of conditions) {
      const rows = await this.db
        .selectFrom('api.analysis_users')
        .select(['id', 'description'])
        .where('github', '@>', JSON.stringify(condition))
        .where('intent', '=', Intent.Hackathon)
        .execute();

      for (const row of rows) {
        const rowId = Number(row.id);
        if (results.has(String(rowId))) {
          continue;
        }
        results.set(String(rowId), {
          id: rowId,
          description: row.description ?? '',
        });
      }
    }

    return {
      list: Array.from(results.values()),
    };
  }

  private async getActiveEcosystemNames(names: string[]): Promise<string[]> {
    const uniqueNames = Array.from(
      new Set(
        names
          .map((name) => name?.trim())
          .filter((name): name is string => !!name),
      ),
    );

    if (uniqueNames.length === 0) {
      return [];
    }

    const activeEcosystems = await this.db
      .selectFrom('data.ecosystems')
      .select(['name'])
      .where('name', 'in', uniqueNames)
      .where('active', '=', true)
      .execute();

    return activeEcosystems.map((ecosystem) => ecosystem.name);
  }

  async getPrivyGithubUsername(uid: string): Promise<string | null> {
    const privyBind = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_openid'])
      .where('bind_uid', '=', uid)
      .where('bind_type', '=', 'privy')
      .executeTakeFirst();

    const account = await this.authService.getPrivyUserBindings(
      privyBind?.bind_openid || '',
    );

    console.log(account);

    if (account == null) {
      return null;
    }

    const githubAccount = account.linked_accounts.find(
      (acc) => acc.type === 'github_oauth',
    );

    return githubAccount?.username || null;
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
     user_total_score AS (SELECT actor_id,

                                 SUM(total_score) AS user_score

                          FROM repo_scores

                          GROUP BY actor_id),

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
       s.user_score,
       COALESCE(
               (SELECT jsonb_agg(
                               jsonb_build_object(
                                       'ecosystem', ecosystem_key,
                                       'repos', repo_details,
                                       'total_score', ecosystem_total_score,
                                       'first_activity_at', ecosystem_first_activity_at,
                                       'last_activity_at', ecosystem_last_activity_at
                               ) ORDER BY ecosystem_total_score DESC
                       )
                FROM ecosystem_repos er
                WHERE er.actor_id = u.actor_id),
               '[]'::jsonb
       ) AS ecosystem_scores
FROM user_ids u
         JOIN user_total_score s ON u.actor_id = s.actor_id
ORDER BY s.user_score DESC;`;

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

// WITH repo_base_scores AS (
// -- Step 1: 从 events 聚合用户-仓库活跃指标（强制时间过滤，限定事件类型，排除空 ID）
//     SELECT e.actor_id,
//            e.repo_id,
//            MAX(CASE WHEN e.event_type = 'PushEvent' THEN 1 ELSE 0 END)   AS has_commit,
//            COUNT(CASE WHEN e.event_type = 'PullRequestEvent' THEN 1 END) AS pr_count,
//            MIN(e.created_at)                                             AS first_activity_at,
//            MAX(e.created_at)                                             AS last_activity_at
//     FROM data.events e
//     WHERE e.event_type IN ('PushEvent', 'PullRequestEvent')
//     GROUP BY e.actor_id, e.repo_id),
//      repo_scores AS (
// -- Step 2: 计算每个用户-仓库的总分
//          SELECT actor_id,
//                 repo_id,
//                 (has_commit * 1 + pr_count * 2) AS total_score,
//                 first_activity_at,
//                 last_activity_at
//          FROM repo_base_scores),
//      active_repos AS (
// -- Step 3: 提取有活动记录的仓库列表（仅 repo_id）
//          SELECT DISTINCT repo_id
//          FROM repo_scores),
//      repo_ecosystems AS (
// -- Step 4: 展开每个活动仓库的生态键
//          SELECT r.repo_id,
//                 ek.ecosystem_key
//          FROM active_repos ar
//                   JOIN data.repos r ON r.repo_id = ar.repo_id
//                   CROSS JOIN LATERAL jsonb_object_keys(r.upstream_marks) AS ek(ecosystem_key)
//          WHERE r.upstream_marks <> '{}'::jsonb),
//      user_total_score AS (
// -- Step 5: 用户总得分（跨所有仓库）
//          SELECT actor_id,
//                 SUM(total_score) AS user_score
//          FROM repo_scores
//          GROUP BY actor_id),
//      repo_ecosystem_scores AS (
// -- Step 6: 关联仓库分数与生态信息
//          SELECT rs.actor_id,
//                 rs.repo_id,
//                 re.ecosystem_key,
//                 rs.total_score,
//                 rs.first_activity_at,
//                 rs.last_activity_at
//          FROM repo_scores rs
//                   JOIN repo_ecosystems re ON rs.repo_id = re.repo_id
//          WHERE rs.total_score > 0),
//      unique_ecosystem_repos AS (
// -- Step 7: 去重，保留 actor-ecosystem-repo 粒度唯一明细
//          SELECT DISTINCT actor_id,
//                          ecosystem_key,
//                          repo_id,
//                          total_score,
//                          first_activity_at,
//                          last_activity_at
//          FROM repo_ecosystem_scores),
//      ecosystem_repos AS (
// -- Step 8: 关联 repos 获取最新 repo_name，并聚合为生态级 JSONB
//          SELECT uer.actor_id,
//                 uer.ecosystem_key,
//                 jsonb_agg(
//                         jsonb_build_object(
//                                 'repo_name', r.repo_name,
//                                 'score', uer.total_score,
//                                 'first_activity_at', uer.first_activity_at,
//                                 'last_activity_at', uer.last_activity_at
//                         )
//                         ORDER BY uer.total_score DESC
//                 )                          AS repo_details,
//                 SUM(uer.total_score)       AS ecosystem_total_score,
//                 MIN(uer.first_activity_at) AS ecosystem_first_activity_at,
//                 MAX(uer.last_activity_at)  AS ecosystem_last_activity_at
//          FROM unique_ecosystem_repos uer
//                   JOIN data.repos r ON r.repo_id = uer.repo_id
//          GROUP BY uer.actor_id, uer.ecosystem_key),
//      actor_ecosystems_json AS (
// -- Step 9: 预聚合为每位用户的生态数组 JSONB，避免相关子查询
//          SELECT er.actor_id,
//                 jsonb_agg(
//                         jsonb_build_object(
//                                 'ecosystem', er.ecosystem_key,
//                                 'repos', er.repo_details,
//                                 'total_score', er.ecosystem_total_score,
//                                 'first_activity_at', er.ecosystem_first_activity_at,
//                                 'last_activity_at', er.ecosystem_last_activity_at
//                         )
//                         ORDER BY er.ecosystem_total_score DESC
//                 ) AS ecosystem_scores
//          FROM ecosystem_repos er
//          GROUP BY er.actor_id),
//      user_ecosystem_scores AS (
// -- Step 9: 聚合为用户维度生态分数结构
//          SELECT u.actor_id,
//                 u.user_score,
//                 COALESCE(aej.ecosystem_scores, '[]'::jsonb) AS ecosystem_scores
//          FROM user_total_score u
//                   LEFT JOIN actor_ecosystems_json aej ON aej.actor_id = u.actor_id),
//      updated_active AS (
// -- Step 10: 更新 actors.eco_score（仅更新有活动的用户），并返回已更新 actor_id
//          UPDATE data.actors a
//              SET eco_score = jsonb_build_object(
//                      'total_score', ues.user_score,
//                      'ecosystems', ues.ecosystem_scores,
//                      'updated_at', NOW()
//                              )
//              FROM user_ecosystem_scores ues
//              WHERE a.actor_id = ues.actor_id
//              RETURNING a.actor_id)
// -- Step 11: 将未在 updated_active 中的其他用户 eco_score 统一置为 '{}'
// UPDATE data.actors a
// SET eco_score = '{}'::jsonb
// WHERE NOT EXISTS (SELECT 1
//                   FROM updated_active ua
//                   WHERE ua.actor_id = a.actor_id);
