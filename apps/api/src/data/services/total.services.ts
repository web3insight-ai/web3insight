import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey, CacheKeyValue } from '../dto/cache.dto';
import { EcoType, StatsPeriod } from '../dto/data.dto';
import {
  QueryActorDate,
  QueryActorsTotal,
  QueryEcoTotal,
  QueryReposTotal,
} from '../dto/query.dto';
import { ActorDateListDto } from '@/api/dto/api.dto';

@Injectable()
@Console()
export class TotalService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(private cacheDataService: CacheDataService) {}

  async reposTotal(ecoNames: string[]) {
    const sqlRawQuery = `
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
filtered_repos AS (
    SELECT 
        repo_id,
        jsonb_object_keys(upstream_marks) AS ecosystem
    FROM 
        data.repos
    WHERE 
        repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name) FROM ecosystem_list)
),
repo_counts AS (
    SELECT 
        ecosystem,
        COUNT(DISTINCT repo_id) AS repo_count
    FROM 
        filtered_repos
    WHERE 
        ecosystem IN (SELECT ecosystem_name FROM ecosystem_list)
    GROUP BY 
        ecosystem
)
SELECT 
    el.ecosystem_name,
    COALESCE(rc.repo_count, 0) AS repo_count
FROM 
    ecosystem_list el
LEFT JOIN
    repo_counts rc ON el.ecosystem_name = rc.ecosystem
ORDER BY 
    repo_count DESC;`;
    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryReposTotal[]) {
      await this.cacheDataService.updateCacheData(
        CacheKey.RepoTotal,
        { total: row.repo_count },
        new Date().toISOString(),
        row.ecosystem_name,
      );
    }
  }

  async actorsTotalNew(ecoNames: string[]) {
    const sqlRawQuery = `
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
     ecosystem_repos AS (SELECT e.ecosystem_name,
                                r.repo_id
                         FROM ecosystem_list e
                                  JOIN
                              data.repos r ON r.upstream_marks ? e.ecosystem_name),

     actor_first_activity AS (SELECT er.ecosystem_name,
                                     ev.actor_id,
                                     MIN(ev.created_at) AS first_activity_time
                              FROM ecosystem_repos er
                                       JOIN data.events ev ON ev.repo_id = er.repo_id
                              WHERE ev.event_type != 'WatchEvent'
                              GROUP BY er.ecosystem_name, ev.actor_id),

     active_dev_ids AS (SELECT er.ecosystem_name,
                               ev.actor_id
                        FROM ecosystem_repos er
                                 JOIN data.events ev ON ev.repo_id = er.repo_id
                        WHERE ev.event_type IN ('PullRequestEvent', 'PushEvent')
                          AND ev.created_at >= NOW() - INTERVAL '1 years'
                        GROUP BY er.ecosystem_name, ev.actor_id
                        HAVING COUNT(DISTINCT ev.event_type) = 2),

     total_participants AS (SELECT ecosystem_name,
                                   COUNT(DISTINCT actor_id) AS count
                            FROM actor_first_activity
                            GROUP BY ecosystem_name),

     active_participants AS (SELECT ecosystem_name,
                                    COUNT(DISTINCT actor_id) AS count
                             FROM active_dev_ids
                             GROUP BY ecosystem_name),

     new_developers AS (SELECT ecosystem_name,
                               COUNT(DISTINCT actor_id) AS count
                        FROM actor_first_activity
                        WHERE first_activity_time >= NOW() - INTERVAL '90 days'
                        GROUP BY ecosystem_name)

SELECT el.ecosystem_name     AS ecosystem,
       COALESCE(tp.count, 0) AS total_actors,
       COALESCE(ap.count, 0) AS recent_active_actors,
       COALESCE(nd.count, 0) AS new_developers_90days
FROM ecosystem_list el
         LEFT JOIN total_participants tp ON el.ecosystem_name = tp.ecosystem_name
         LEFT JOIN active_participants ap ON el.ecosystem_name = ap.ecosystem_name
         LEFT JOIN new_developers nd ON el.ecosystem_name = nd.ecosystem_name;`;
    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryActorsTotal[]) {
      await this.cacheDataService.updateCacheData(
        CacheKey.ActorTotal,
        { total: row.total_actors },
        new Date().toISOString(),
        row.ecosystem,
      );
      await this.cacheDataService.updateCacheData(
        CacheKey.ActorCoreTotal,
        { total: row.recent_active_actors },
        new Date().toISOString(),
        row.ecosystem,
      );
      await this.cacheDataService.updateCacheData(
        CacheKey.ActorTotalNew,
        { total: row.new_developers_90days },
        new Date().toISOString(),
        row.ecosystem,
      );
    }
  }

  async ecoTotal() {
    const sqlRawQuery = `
SELECT COUNT(DISTINCT ecosystem_name) AS ecosystem_count
FROM (
    SELECT jsonb_object_keys(upstream_marks) AS ecosystem_name
    FROM data.repos
    WHERE upstream_marks != '{}'::jsonb
) AS ecosystems;`;
    const query = CompiledQuery.raw(sqlRawQuery);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryEcoTotal[]) {
      await this.cacheDataService.updateCacheData(
        CacheKey.EcoTotal,
        { total: row.ecosystem_count },
        new Date().toISOString(),
        EcoType.ALL,
      );
    }
  }

  async getActorDate(ecoNames: string[]) {
    const sqlRawQuery = `
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),

     time_unit_list AS (SELECT UNNEST($2::text[]) AS time_unit),

     repos_filtered AS (SELECT r.repo_id,
                               el.ecosystem_name
                        FROM ecosystem_list el
                                 JOIN data.repos r ON r.upstream_marks ? el.ecosystem_name),

     aggregated_data AS (SELECT rf.ecosystem_name,
                                tul.time_unit,
                                DATE_TRUNC(tul.time_unit, ev.created_at) AS date_period,
                                COUNT(DISTINCT ev.actor_id)              AS total
                         FROM repos_filtered rf
                                  CROSS JOIN time_unit_list tul
                                  JOIN data.events ev ON ev.repo_id = rf.repo_id
                         WHERE ev.event_type != 'WatchEvent'
                           AND ev.created_at >= NOW() - INTERVAL '8 months'
                         GROUP BY rf.ecosystem_name, tul.time_unit, DATE_TRUNC(tul.time_unit, ev.created_at)),

     ranked_data AS (SELECT ecosystem_name,
                            time_unit,
                            date_period,
                            total,
                            ROW_NUMBER() OVER (
                                PARTITION BY ecosystem_name, time_unit
                                ORDER BY date_period DESC
                                ) AS rn
                     FROM aggregated_data)

SELECT ecosystem_name,
       time_unit,
       JSON_AGG(
               JSON_BUILD_OBJECT(
                       'date', date_period,
                       'total', total
               ) ORDER BY date_period DESC
       ) AS data
FROM ranked_data
WHERE rn <= 8
GROUP BY ecosystem_name, time_unit
ORDER BY ecosystem_name, time_unit;
`;
    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames, ['week', 'month']]);

    const exec = await this.db.executeQuery(query);

    const results = exec.rows as QueryActorDate[];

    for (const result of results) {
      let cacheKey: CacheKeyValue = CacheKey.ActorMonthTotal;
      if (result.time_unit == StatsPeriod.WEEK) {
        cacheKey = CacheKey.ActorWeekTotal;
      }
      const resData = new ActorDateListDto();

      resData.list = result.data;
      await this.cacheDataService.updateCacheData(
        cacheKey,
        resData,
        new Date().toISOString(),
        result.ecosystem_name,
      );
    }
  }

  @Command({
    command: 'sync:eco:total',
    description: 'Test eco data',
  })
  async test(): Promise<void> {
    const ecoTypes = Object.values(EcoType);
    await this.getActorDate(ecoTypes.filter((eco) => eco !== EcoType.ALL));
    await this.reposTotal(ecoTypes);
    await this.actorsTotalNew(ecoTypes);
    await this.ecoTotal();
    return null;
  }
}
