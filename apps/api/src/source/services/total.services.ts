import { KYSELY } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CompiledQuery, Kysely, sql } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { EcoType } from '../dto/data.dto';
import { ActorDateListDto, StatsPeriod } from '@/api/dto/api.dto';
import {
  QueryActorsTotal,
  QueryEcoTotal,
  QueryReposTotal,
} from '../dto/query.dto';

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
        web3.repos
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
        row.ecosystem,
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
                              web3.repos r ON r.upstream_marks ? e.ecosystem_name),

     actor_first_activity AS (SELECT er.ecosystem_name,
                                     ev.actor_id,
                                     MIN(ev.created_at) AS first_activity_time
                              FROM ecosystem_repos er
                                       JOIN web3.event ev ON ev.repo_id = er.repo_id
                              GROUP BY er.ecosystem_name, ev.actor_id),

     active_dev_ids AS (SELECT er.ecosystem_name,
                               ev.actor_id
                        FROM ecosystem_repos er
                                 JOIN web3.event ev ON ev.repo_id = er.repo_id
                        WHERE ev.event_type IN ('PullRequestEvent', 'PushEvent')
                          AND ev.created_at >= NOW() - INTERVAL '3 years'
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
    FROM web3.repos
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

  async getActorStats(ecoNames: string[], period: StatsPeriod) {
    for (const ecoName of ecoNames) {
      const cacheKey =
        period == StatsPeriod.MONTH
          ? CacheKey.ActorMonthTotal
          : CacheKey.ActorWeekTotal;

      let dateTruncUnit: string = StatsPeriod.WEEK;

      const aliasName = 'date';

      if (period === StatsPeriod.WEEK) {
        dateTruncUnit = 'week';
      } else if (period === StatsPeriod.MONTH) {
        dateTruncUnit = 'month';
      }

      let query = this.db
        .selectFrom('web3.event')
        .select([
          sql<Date>`DATE_TRUNC(${dateTruncUnit}, "web3"."event"."created_at")`.as(
            aliasName,
          ),
          this.db.fn.count('web3.event.actor_id').distinct().as('total'),
        ]);

      query = query
        .innerJoin('web3.repos', 'web3.event.repo_id', 'web3.repos.repo_id')
        .where('upstream_marks', '?|', sql<string[]>`ARRAY[${ecoName}]`);

      query = query.groupBy(aliasName).orderBy(aliasName, 'desc').limit(8);

      const results = await query.execute();

      const data = results.map((row) => ({
        date: row[aliasName],
        total: Number(row.total),
      }));

      const resData = new ActorDateListDto();

      resData.list = data;

      await this.cacheDataService.updateCacheData(
        cacheKey,
        resData,
        new Date().toISOString(),
        ecoName,
      );
    }
  }

  @Command({
    command: 'sync:eco:total',
    description: 'Test eco data',
  })
  async test() {
    const ecoTypes = Object.values(EcoType);
    await this.reposTotal(ecoTypes);
    await this.actorsTotalNew(ecoTypes);
    await this.ecoTotal();
    await this.getActorStats(
      ecoTypes.filter((eco) => eco !== EcoType.ALL),
      StatsPeriod.MONTH,
    );
    await this.getActorStats(
      ecoTypes.filter((eco) => eco !== EcoType.ALL),
      StatsPeriod.WEEK,
    );
    return null;
  }
}
