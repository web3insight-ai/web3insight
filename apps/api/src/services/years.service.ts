import { CompiledQuery } from 'kysely';
import type { DbClient } from '@/db/client';
import type { CacheService } from '@/services/cache.service';
import { CacheKey } from '@/data/dto/cache.dto';
import type {
  QueryChineseEcosystemParticipation,
  QueryChineseEcosystemNewDevelopers,
  QueryChineseRepoParticipation,
  QueryYearlyDeveloperStat,
} from '@/data/dto/query.dto';

/**
 * Pure-class port of data/services/years.services.ts. Console @Command
 * decorators stripped; Cron/Inngest will call methods directly in Phase F.
 */
export class YearsService {
  constructor(
    private readonly db: DbClient,
    private readonly cacheService: CacheService,
  ) {}

  private readonly chineseCountryCodes = ['CN', 'HK', 'MO', 'TW', 'SG', 'MY'];

  async getChineseDeveloperYearlyStats(
    targetYear: number = 2025,
  ): Promise<QueryYearlyDeveloperStat[]> {
    const sqlRawQuery = `
WITH target_countries AS (SELECT UNNEST($1::text[]) AS country_code),
     chinese_actors AS (SELECT a.actor_id
                        FROM data.actors a
                        WHERE a.country IN (SELECT country_code FROM target_countries)),

     actor_events AS (SELECT ev.actor_id,
                             DATE_TRUNC('year', ev.created_at) AS activity_year
                      FROM data.events ev
                               JOIN chinese_actors ca ON ca.actor_id = ev.actor_id
                      WHERE ev.event_type IN ('PullRequestEvent', 'PushEvent')
                        AND ev.created_at < MAKE_DATE($2 + 1, 1, 1)),

     first_activity AS (SELECT actor_id, MIN(activity_year) AS first_activity_year
                        FROM actor_events
                        GROUP BY actor_id),

     yearly_activity AS (SELECT EXTRACT(YEAR FROM ae.activity_year)::int AS activity_year,
                                COUNT(DISTINCT ae.actor_id)                                             AS active_developers,
                                COUNT(DISTINCT ae.actor_id)
                                    FILTER (WHERE fa.first_activity_year = ae.activity_year) AS new_developers
                         FROM actor_events ae
         JOIN first_activity fa ON fa.actor_id = ae.actor_id
                         GROUP BY activity_year),

     yearly_growth AS (SELECT activity_year,
                              active_developers,
                              new_developers,
                              LAG(active_developers) OVER (ORDER BY activity_year) AS prev_year_active_devs,
                              LAG(new_developers) OVER (ORDER BY activity_year) AS prev_year_new_devs
                       FROM yearly_activity)

SELECT activity_year,
       active_developers,
       new_developers,
       CASE
           WHEN prev_year_active_devs IS NULL OR prev_year_active_devs = 0 THEN NULL
           ELSE ROUND(((active_developers - prev_year_active_devs) * 100.0 / prev_year_active_devs)::numeric, 2)
       END AS active_developers_yearly_growth_rate,
       CASE
           WHEN prev_year_new_devs IS NULL OR prev_year_new_devs = 0 THEN NULL
           ELSE ROUND(((new_developers - prev_year_new_devs) * 100.0 / prev_year_new_devs)::numeric, 2)
       END AS new_developers_yearly_growth_rate
FROM yearly_growth
WHERE activity_year BETWEEN $2 - 5 AND $2
ORDER BY activity_year;
`;
    const query = CompiledQuery.raw(sqlRawQuery, [
      this.chineseCountryCodes,
      targetYear,
    ]);

    const results = await this.db.executeQuery(query);

    return results.rows as QueryYearlyDeveloperStat[];
  }

  async getChineseEcosystemParticipationDistribution(
    targetYear: number = 2025,
  ): Promise<QueryChineseEcosystemParticipation[]> {
    const sqlRawQuery = `
WITH target_countries AS (SELECT UNNEST($1::text[]) AS country_code),
     chinese_actors AS (SELECT a.actor_id
                        FROM data.actors a
                        WHERE a.country IN (SELECT country_code FROM target_countries)),

     ecosystem_repos AS (SELECT r.repo_id,
                                ek.ecosystem_key AS ecosystem_name
                         FROM data.repos r
                                  CROSS JOIN LATERAL jsonb_object_keys(r.upstream_marks) AS ek(ecosystem_key)
                         WHERE r.upstream_marks <> '{}'::jsonb),

     ecosystem_events AS (SELECT er.ecosystem_name,
                                 ev.actor_id
                          FROM ecosystem_repos er
                                   JOIN data.events ev ON ev.repo_id = er.repo_id
                                   JOIN chinese_actors ca ON ca.actor_id = ev.actor_id
                          WHERE ev.event_type IN ('PullRequestEvent', 'PushEvent')
                            AND ev.created_at >= MAKE_DATE($2, 1, 1)
                            AND ev.created_at < MAKE_DATE($2 + 1, 1, 1)),

     eco_actor_counts AS (SELECT ecosystem_name,
                                 COUNT(DISTINCT actor_id) AS developer_count
                          FROM ecosystem_events
                          GROUP BY ecosystem_name)

SELECT eco.name AS ecosystem_name,
       eco.active,
       eco.kind,
       eac.developer_count
FROM data.ecosystems eco
         JOIN eco_actor_counts eac ON eac.ecosystem_name = eco.name
WHERE eac.developer_count > 0
ORDER BY eac.developer_count DESC, eco.name ASC;
`;
    const query = CompiledQuery.raw(sqlRawQuery, [
      this.chineseCountryCodes,
      targetYear,
    ]);

    const results = await this.db.executeQuery(query);
    return results.rows as QueryChineseEcosystemParticipation[];
  }

  async getChineseEcosystemNewDevelopersDistribution(
    targetYear: number = 2025,
  ): Promise<QueryChineseEcosystemNewDevelopers[]> {
    const sqlRawQuery = `
WITH target_countries AS (SELECT UNNEST($1::text[]) AS country_code),
     chinese_actors AS (SELECT a.actor_id
                        FROM data.actors a
                        WHERE a.country IN (SELECT country_code FROM target_countries)),

     ecosystem_repos AS (SELECT r.repo_id,
                                ek.ecosystem_key AS ecosystem_name
                         FROM data.repos r
                                  CROSS JOIN LATERAL jsonb_object_keys(r.upstream_marks) AS ek(ecosystem_key)
                         WHERE r.upstream_marks <> '{}'::jsonb),

     actor_eco_events AS (SELECT er.ecosystem_name,
                                 ev.actor_id,
                                 ev.created_at
                          FROM ecosystem_repos er
                                   JOIN data.events ev ON ev.repo_id = er.repo_id
                                   JOIN chinese_actors ca ON ca.actor_id = ev.actor_id
                          WHERE ev.event_type IN ('PullRequestEvent', 'PushEvent')),

     actor_eco_first_activity AS (SELECT ecosystem_name,
                                         actor_id,
                                         MIN(created_at) AS first_activity_at
                                  FROM actor_eco_events
                                  GROUP BY ecosystem_name, actor_id),

     new_developers AS (SELECT ecosystem_name,
                               COUNT(DISTINCT actor_id) AS new_developer_count
                        FROM actor_eco_first_activity
                        WHERE first_activity_at >= MAKE_DATE($2, 1, 1)
                          AND first_activity_at < MAKE_DATE($2 + 1, 1, 1)
                        GROUP BY ecosystem_name)

SELECT eco.name AS ecosystem_name,
       eco.active,
       eco.kind,
       nd.new_developer_count
FROM data.ecosystems eco
         JOIN new_developers nd ON nd.ecosystem_name = eco.name
WHERE nd.new_developer_count > 0
ORDER BY nd.new_developer_count DESC, eco.name ASC;
`;
    const query = CompiledQuery.raw(sqlRawQuery, [
      this.chineseCountryCodes,
      targetYear,
    ]);

    const results = await this.db.executeQuery(query);
    return results.rows as QueryChineseEcosystemNewDevelopers[];
  }

  async getChineseTopReposByParticipation(
    targetYear: number = 2025,
    limit: number = 300,
  ): Promise<QueryChineseRepoParticipation[]> {
    const sqlRawQuery = `
WITH target_countries AS (SELECT UNNEST($1::text[]) AS country_code),
     chinese_actors AS (SELECT a.actor_id
                        FROM data.actors a
                        WHERE a.country IN (SELECT country_code FROM target_countries)),

     ecosystem_repos AS (SELECT r.repo_id,
                                ek.ecosystem_key AS ecosystem_name
                         FROM data.repos r
                                  CROSS JOIN LATERAL jsonb_object_keys(r.upstream_marks) AS ek(ecosystem_key)
                         WHERE r.upstream_marks <> '{}'::jsonb),

     ecosystem_repo_ids AS (SELECT DISTINCT repo_id
                            FROM ecosystem_repos),

     repo_actor_events AS (SELECT ev.repo_id,
                                  ev.actor_id
                           FROM data.events ev
                                    JOIN ecosystem_repo_ids er ON er.repo_id = ev.repo_id
                                    JOIN chinese_actors ca ON ca.actor_id = ev.actor_id
                           WHERE ev.event_type IN ('PullRequestEvent', 'PushEvent')
                             AND ev.created_at >= MAKE_DATE($2, 1, 1)
                             AND ev.created_at < MAKE_DATE($2 + 1, 1, 1)),

     repo_developer_counts AS (SELECT repo_id,
                                      COUNT(DISTINCT actor_id) AS developer_count
                               FROM repo_actor_events
                               GROUP BY repo_id)

SELECT r.repo_id,
       r.repo_name,
       rdc.developer_count
FROM repo_developer_counts rdc
         JOIN data.repos r ON r.repo_id = rdc.repo_id
ORDER BY rdc.developer_count DESC, r.repo_name ASC
LIMIT $3;
`;
    const query = CompiledQuery.raw(sqlRawQuery, [
      this.chineseCountryCodes,
      targetYear,
      limit,
    ]);

    const results = await this.db.executeQuery(query);
    return results.rows as QueryChineseRepoParticipation[];
  }

  async syncChineseYearlyCaches(targetYear: number = 2025) {
    const [yearlyStats, participation, newDevelopers, topRepos] =
      await Promise.all([
        this.getChineseDeveloperYearlyStats(targetYear),
        this.getChineseEcosystemParticipationDistribution(targetYear),
        this.getChineseEcosystemNewDevelopersDistribution(targetYear),
        this.getChineseTopReposByParticipation(targetYear),
      ]);

    const payload = {
      yearly_stats: yearlyStats,
      eco_participation: participation,
      eco_new_developers: newDevelopers,
      top_repos: topRepos,
      target_year: targetYear,
    };

    await this.cacheService.update(
      CacheKey.YearsChineseSummary,
      payload,
      new Date().toISOString(),
    );
  }
}
