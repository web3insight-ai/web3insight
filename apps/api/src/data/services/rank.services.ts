import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { ECO_ALL, EcoNameFilter } from '../dto/data.dto';
import {
  EcoRankDto,
  EcoRankListDto,
  TotalDto,
  RepoRankListDto,
  ActorScoreRankListDto,
} from '@/api/dto/api.dto';
import {
  QueryTopActors,
  QueryTopStar,
  QueryTopStarRepo,
} from '../dto/query.dto';
import { ReposService } from './repos.services';
import { EcoService } from './eco.services';

export class EcoRankItem {
  eco_name: string;
  repo_name: string;
  rn: number;
  score: number;
}

export class EcoRankResult {
  list: EcoRankItem[] = [];
}

@Injectable()
@Console()
export class RankService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(
    private cacheDataService: CacheDataService,
    private reposService: ReposService,
    private ecoService: EcoService,
  ) {}

  async ecoRankTotal(ecoName: EcoNameFilter, cache: boolean = true) {
    const dbData = await this.cacheDataService.getCacheData(
      CacheKey.EcoRank,
      ecoName,
    );

    if (!dbData && cache) {
      throw new Error('Cache not found');
    }

    if (dbData && cache) {
      return dbData;
    }

    const data: EcoRankDto[] = [];

    const ecoTypes = await this.ecoService.getActiveEcoNames();
    for (const ecoName of ecoTypes) {
      const actorsTotalAllScopeResult =
        await this.cacheDataService.getCacheData(CacheKey.ActorTotal, ecoName);

      const actorsTotalCoreScopeResult =
        await this.cacheDataService.getCacheData(
          CacheKey.ActorCoreTotal,
          ecoName,
        );

      const actorsNewTotal = await this.cacheDataService.getCacheData(
        CacheKey.ActorTotalNew,
        ecoName,
      );

      const totalRepos = await this.cacheDataService.getCacheData(
        CacheKey.RepoTotal,
        ecoName,
      );

      console.log(
        `EcoRankTotal: ${ecoName} - actors total: ${
          (actorsTotalAllScopeResult?.cache_data as TotalDto).total
        }, new actors: ${
          (actorsNewTotal?.cache_data as TotalDto).total
        }, core actors: ${
          (actorsTotalCoreScopeResult?.cache_data as TotalDto).total
        }, repos total: ${(totalRepos?.cache_data as TotalDto).total}`,
      );

      data.push({
        eco_name: ecoName,
        actors_total: (actorsTotalAllScopeResult?.cache_data as TotalDto).total,
        actors_new_total: (actorsNewTotal?.cache_data as TotalDto).total,
        actors_core_total: (actorsTotalCoreScopeResult?.cache_data as TotalDto)
          .total,
        repos_total: (totalRepos?.cache_data as TotalDto).total,
        kind: '',
      });
    }

    data.sort((a, b) => b.actors_core_total - a.actors_core_total);

    const ecoNames = data.map((item) => item.eco_name);

    const kind = await this.db
      .selectFrom('data.ecosystems')
      .select(['name', 'kind'])
      .where('active', '=', true)
      .where('name', 'in', ecoNames)
      .orderBy('score', 'desc')
      .orderBy('name', 'asc')
      .execute();

    data.forEach((item) => {
      const ecoKind = kind.find((k) => k.name === item.eco_name);
      if (ecoKind) {
        item.kind = ecoKind.kind;
      }
    });

    const cacheData = new EcoRankListDto();
    cacheData.list = data;

    await this.cacheDataService.updateCacheData(
      CacheKey.EcoRank,
      cacheData,
      new Date().toISOString(),
    );
    return dbData;
  }

  async getTopScoreActors(ecoNames: string[]) {
    const sqlRawQuery = `
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
     filtered_events AS (SELECT events.actor_id,
                                events.repo_id,
                                LEAST(COUNT(*), 50) AS score  
                         FROM data.repos repos
                                  JOIN data.events events ON repos.repo_id = events.repo_id
                         WHERE events.event_type = 'PullRequestEvent'
                           AND repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name) FROM ecosystem_list)
                           AND events.created_at >= NOW() - INTERVAL '1 year'  
                         GROUP BY events.actor_id, events.repo_id),

     ecosystem_scores AS (SELECT e.ecosystem_name AS ecosystem,
                                 fe.actor_id,
                                 fe.repo_id,
                                 repos.repo_name,
                                 fe.score
                          FROM filtered_events fe
                                   JOIN data.repos repos ON fe.repo_id = repos.repo_id
                                   CROSS JOIN ecosystem_list e
                          WHERE repos.upstream_marks ? e.ecosystem_name),

     actor_totals AS (SELECT es.ecosystem,
                             es.actor_id,
                             a.actor_login,
                             SUM(es.score)                                                             AS total_score,
                             ROW_NUMBER() OVER (PARTITION BY es.ecosystem ORDER BY SUM(es.score) DESC) AS rank
                      FROM ecosystem_scores es
                               JOIN data.actors a ON es.actor_id = a.actor_id
                      WHERE a.actor_login NOT ILIKE '%[bot]%'
                        AND a.actor_login NOT ILIKE 'bot-%'
                        AND a.actor_login NOT ILIKE '%-bot'
                        AND a.actor_login NOT ILIKE 'Copilot'
                      GROUP BY es.ecosystem, es.actor_id, a.actor_login),

     top_contributors AS (SELECT at.ecosystem,
                                 at.rank,
                                 at.actor_id,
                                 at.actor_login,
                                 at.total_score,
                                 (SELECT json_agg(json_build_object(
                                                          'repo_id', es.repo_id,
                                                          'repo_name', es.repo_name,
                                                          'score', es.score
                                                  ) ORDER BY es.score DESC)
                                  FROM (SELECT repo_id, repo_name, score
                                        FROM ecosystem_scores
                                        WHERE ecosystem = at.ecosystem
                                          AND actor_id = at.actor_id
                                        ORDER BY score DESC
                                        LIMIT 10) es) AS top_repos
                          FROM actor_totals at
                          WHERE at.rank <= 100)
SELECT ecosystem,
       json_agg(json_build_object(
                        'actor_id', actor_id,
                        'actor_login', actor_login,
                        'total_score', total_score,
                        'top_repos', top_repos
                ) ORDER BY rank) AS top_actors
FROM top_contributors
GROUP BY ecosystem
ORDER BY ecosystem;
`;
    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryTopActors[]) {
      row.top_actors.forEach((actor) => {
        // Old version compatibility
        actor.total_commit_count = actor.total_score;
      });
      const cacheData = new ActorScoreRankListDto();
      cacheData.list = row.top_actors;
      await this.cacheDataService.updateCacheData(
        CacheKey.ActorScoreRank,
        cacheData,
        new Date().toISOString(),
        row.ecosystem,
      );
    }
  }

  async repoStarRank(ecoNames: string[]) {
    const sqlRawQuery = `
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
     repo_stars AS (SELECT events.repo_id,
                           COUNT(DISTINCT events.actor_id) star_count
                    FROM data.repos repos
                             JOIN data.events events ON repos.repo_id = events.repo_id
                    WHERE events.event_type = 'WatchEvent'
                      AND repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name)
                                                   FROM ecosystem_list)
                    GROUP BY events.repo_id),
     repo_contributors AS (SELECT events.repo_id,
                                  COUNT(DISTINCT events.actor_id) contributor_count
                           FROM data.repos repos
                                    JOIN data.events events ON repos.repo_id = events.repo_id
                           WHERE events.event_type IN ('PushEvent', 'PullRequestEvent')
                             AND repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name)
                                                          FROM ecosystem_list)
                           GROUP BY events.repo_id),
     top_ecosystem AS (SELECT ecosystem.ecosystem_name             ecosystem,
                              repo_stars.repo_id,
                              repos.repo_name,
                              repo_stars.star_count,
                              COALESCE(rc.contributor_count, 0) as contributor_count,
                              ROW_NUMBER() OVER (
                                  PARTITION BY ecosystem.ecosystem_name
                                  ORDER BY repo_stars.star_count DESC
                                  )                                ranking
                       FROM repo_stars
                                JOIN data.repos repos ON repo_stars.repo_id = repos.repo_id
                                CROSS JOIN ecosystem_list ecosystem
                                LEFT JOIN repo_contributors rc ON repo_stars.repo_id = rc.repo_id
                       WHERE repos.upstream_marks ? ecosystem.ecosystem_name
                       AND NOT (repos.api->>'archived')::boolean)
SELECT ecosystem,
       json_agg(
               json_build_object(
                       'repo_id', repo_id,
                       'repo_name', repo_name,
                       'star_count', star_count,
                       'contributor_count', contributor_count
               )
       ) top_repositories
FROM top_ecosystem
WHERE ranking <= 200
GROUP BY ecosystem
ORDER BY ecosystem;`;

    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryTopStar[]) {
      const ids = row.top_repositories.map((repo) => repo.repo_id);

      const res = await this.reposService.getRepoInfo(ids);

      const data: QueryTopStarRepo[] = row.top_repositories.map((row) => {
        const api = res.find((r) => r.id === row.repo_id);
        return {
          ...row,
          star_count: api.stargazers_count,
          forks_count: api.forks_count,
          open_issues_count: api.open_issues_count,
        };
      });
      data.sort((a, b) => b.star_count - a.star_count);
      const cacheData = new RepoRankListDto();
      cacheData.list = data;
      await this.cacheDataService.updateCacheData(
        CacheKey.RepoStarRank,
        cacheData,
        new Date().toISOString(),
        row.ecosystem,
      );
    }
    return results.rows;
  }

  async get7daysDevelopersRank() {
    const sqlRawQuery = `
WITH filtered_events AS (SELECT repo_id,
                                actor_id
                         FROM data.events
                         WHERE created_at >= DATE_TRUNC('day', NOW()) - INTERVAL '7 days'
                           AND event_type IN ('PullRequestEvent', 'PushEvent')),
     developer_count AS (SELECT repo_id,
                                COUNT(DISTINCT actor_id) AS developer_cnt
                         FROM filtered_events
                         GROUP BY repo_id),

     top200_repo AS (SELECT repo_id,
                            developer_cnt
                     FROM developer_count
                     ORDER BY developer_cnt DESC
                     LIMIT 200)

SELECT json_agg(
               json_build_object(
                       'repo_id', tr.repo_id,
                       'repo_name', r.repo_name,
                       'dev_7_day', tr.developer_cnt
               ) ORDER BY tr.developer_cnt DESC
       ) AS top_repositories

FROM top200_repo tr
         JOIN data.repos r ON r.repo_id = tr.repo_id;`;

    const query = CompiledQuery.raw(sqlRawQuery);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryTopStar[]) {
      const ids = row.top_repositories.map((repo) => repo.repo_id);

      const res = await this.reposService.getRepoInfo(ids);

      const data: QueryTopStarRepo[] = row.top_repositories.map((row) => {
        const api = res.find((r) => r.id === row.repo_id);
        return {
          ...row,
          star_count: api.stargazers_count,
          forks_count: api.forks_count,
          open_issues_count: api.open_issues_count,
          description: api.description,
        };
      });
      const cacheData = new RepoRankListDto();
      cacheData.list = data;
      await this.cacheDataService.updateCacheData(
        CacheKey.RepoDevRank7d,
        cacheData,
        new Date().toISOString(),
        'ALL',
      );
    }
    return results.rows;
  }

  async get7daysTopStarRepos(ecoNames: string[]) {
    const sqlRawQuery = `
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
     time_range AS (SELECT date_trunc('day', max(created_at))                     AS last_day,
                           date_trunc('day', max(created_at)) - INTERVAL '6 days' AS start_day
                    FROM data.events),

     target_repos AS (SELECT repo_id
                      FROM data.repos
                      WHERE upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name) FROM ecosystem_list)),

     recent_stars AS (SELECT e.repo_id,
                             COUNT(DISTINCT e.actor_id) AS star_growth_7d
                      FROM data.events e
                               JOIN time_range t
                                    ON date_trunc('day', e.created_at) BETWEEN t.start_day AND t.last_day
                               JOIN target_repos tr
                                    ON e.repo_id = tr.repo_id
                      WHERE e.event_type = 'WatchEvent'
                      GROUP BY e.repo_id),

     ranked AS (SELECT eco.ecosystem_name      AS ecosystem,
                       rs.repo_id,
                       r.repo_name,
                       rs.star_growth_7d,
                       r.api ->> 'description' AS repo_description,
                       ROW_NUMBER() OVER (
                           PARTITION BY eco.ecosystem_name
                           ORDER BY rs.star_growth_7d DESC
                           )                   AS ranking
                FROM recent_stars rs
                         JOIN data.repos r ON r.repo_id = rs.repo_id
                         CROSS JOIN ecosystem_list eco
                WHERE r.upstream_marks ? eco.ecosystem_name
                  AND NOT (r.api ->> 'archived')::boolean)

SELECT ecosystem,
       json_agg(
               json_build_object(
                       'repo_id', repo_id,
                       'repo_name', repo_name,
                       'star_growth_7d', star_growth_7d,
                       'description', repo_description
               ) ORDER BY ranking
       ) AS top_repositories
FROM ranked
WHERE ranking <= 200
GROUP BY ecosystem
ORDER BY ecosystem;`;
    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryTopStar[]) {
      const ids = row.top_repositories.map((repo) => repo.repo_id);

      const res = await this.reposService.getRepoInfo(ids);

      const data: QueryTopStarRepo[] = row.top_repositories.map((row) => {
        const api = res.find((r) => r.id === row.repo_id);
        return {
          ...row,
          star_count: api.stargazers_count,
          forks_count: api.forks_count,
          open_issues_count: api.open_issues_count,
          description: api.description,
        };
      });
      const cacheData = new RepoRankListDto();
      cacheData.list = data;
      await this.cacheDataService.updateCacheData(
        CacheKey.RepoStarRank7d,
        cacheData,
        new Date().toISOString(),
        row.ecosystem,
      );
    }
    return results.rows;
  }

  async getEcoRepoRank(ecoNames: string[]) {
    // Original SQL query logic
    const sqlRawQuery = `
      WITH
      -- Ecosystems to analyze
      eco_list as (
          select distinct
              unnest($1::text[]) as eco_name
      ),
      -- Active developers: developers who have submitted PRs in at least 9 months within the past 1 year
      active_actor as (
          select
              actor_id
          from
              data.events
          where
              created_at >= now() - interval '1 year'
              and abnormal = 0
              and event_type = 'PullRequestEvent'
              and payload::jsonb ->> 'action' = 'opened'
              and payload::jsonb -> 'pull_request' -> 'user' ->> 'type' = 'User'
          group by
              actor_id
          having
              count(distinct to_char(created_at, 'YYYY-MM')) >= 9
      ),
      -- Statistics of repository events in the past 1 year: active developer count, inactive developer count, 
      -- active developer submission count, inactive developer submission count, star count, fork count
      repo_metric as (
          select
              t1.repo_id,
              count(distinct t1.actor_id) filter (
                  where
                      t1.event_type = 'PullRequestEvent'
                      and active_actor.actor_id is not null
              ) active_actor_count,
              count(distinct t1.actor_id) filter (
                  where
                      t1.event_type = 'PullRequestEvent'
                      and active_actor.actor_id is null
              ) none_active_actor_count,
              count(distinct t1.id) filter (
                  where
                      t1.event_type = 'PullRequestEvent'
                      and active_actor.actor_id is not null
              ) active_actor_pr_count,
              count(distinct t1.id) filter (
                  where
                      t1.event_type = 'PullRequestEvent'
                      and active_actor.actor_id is null
              ) none_active_actor_pr_count,
              count(distinct t1.id) filter (
                  where
                      t1.event_type = 'WatchEvent'
              ) as star_count,
              count(distinct t1.id) filter (
                  where
                      t1.event_type = 'ForkEvent'
              ) as fork_count
          from
              (
                  select
                      id,
                      actor_id,
                      repo_id,
                      event_type
                  from
                      data.events
                  where
                      created_at >= now() - interval '1 year'
                      and abnormal = 0
                      and (
                          event_type in ('WatchEvent', 'ForkEvent')
                          or (
                              event_type = 'PullRequestEvent'
                              and payload ->> 'action' = 'opened'
                              and payload -> 'pull_request' -> 'user' ->> 'type' = 'User'
                          )
                      )
              ) as t1
              left join active_actor on t1.actor_id = active_actor.actor_id
          group by
              t1.repo_id
      ),
      -- Aggregate repository's ecosystems and ecosystem count
      repo_eco as (
          select
              repo_id,
              max(repo_name) as repo_name,
              array_agg(distinct key) as eco_names,
              array_length(array_agg(distinct key), 1) as eco_count
          from
              data.repos,
              jsonb_each(upstream_marks)
              inner join eco_list on key = eco_list.eco_name
          group by
              repo_id
      ),
      eco_repo_actor as (
          select
              t1.repo_id,
              t1.actor_id,
              t2.eco_name
          from
              (
                  select
                      repo_id,
                      actor_id
                  from
                      data.events
                  where
                      created_at >= now() - interval '1 year'
                      and abnormal = 0
                      and event_type = 'PullRequestEvent'
                      and payload::jsonb ->> 'action' = 'opened'
                      and payload::jsonb -> 'pull_request' -> 'user' ->> 'type' = 'User'
                  group by
                      repo_id,
                      actor_id
              ) as t1
              inner join (
                  select
                      repo_id,
                      repo_name,
                      unnest(eco_names) as eco_name
                  from
                      repo_eco
              ) as t2 on t1.repo_id = t2.repo_id
          group by
              t1.repo_id,
              t1.actor_id,
              t2.eco_name
      ),
      repo_connection as (
          select
              t1.eco_name,
              t1.repo_id,
              sum(t2.actor_repo_cnt - 1) as connection_cnt
          from
              eco_repo_actor as t1
              inner join (
                  select
                      eco_name,
                      actor_id,
                      count(distinct repo_id) as actor_repo_cnt
                  from
                      eco_repo_actor
                  group by
                      eco_name,
                      actor_id
              ) as t2 on t1.eco_name = t2.eco_name
              and t1.actor_id = t2.actor_id
          group by
              t1.eco_name,
              t1.repo_id
      ),
      -- Calculate repository score:
      -- - Use saturation function to process statistics
      -- - Weight of repository connections and developer count is greater than behavior weight
      -- - If a project belongs to multiple ecosystems, apply exponential decay: $e^{-0.3 * (eco_num - 1)}$
      eco_metric as (
          select
              eco_name,
              repo_name,
              (
                  0.9 * (
                      0.6 * (1 - exp(-0.01 * connection_cnt::numeric)) + 0.25 * (1 - exp(-0.1 * active_actor_count::numeric)) + 0.15 * (1 - exp(-0.1 * none_active_actor_count::numeric))
                  ) + 0.1 * (
                      0.4 * (1 - exp(-0.001 * active_actor_pr_count::numeric)) + 0.3 * (
                          1 - exp(-0.001 * none_active_actor_pr_count::numeric)
                      ) + 0.15 * (1 - exp(-0.001 * star_count::numeric)) + 0.15 * (1 - exp(-0.001 * fork_count::numeric))
                  )
              ) * exp(-0.1 * (eco_count::numeric - 1.0)) as score
          from
              repo_metric
              inner join repo_eco on repo_metric.repo_id = repo_eco.repo_id
              inner join repo_connection on repo_metric.repo_id = repo_connection.repo_id
      ),
      final_table as (
          select
              eco_name,
              repo_name,
              rank() over (
                  partition by
                      eco_name
                  order by
                      score desc
              ) as rn,
              score
          from
              eco_metric
      )
      select
          eco_name,
          repo_name,
          rn,
          score
      from
          final_table
      where
          rn <= 10
      order by
          eco_name,
          rn;
    `;

    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);
    const results = await this.db.executeQuery(query);

    // Group results by ecosystem
    const groupedResults: { [key: string]: EcoRankItem[] } = {};

    for (const row of results.rows as any[]) {
      if (!groupedResults[row.eco_name]) {
        groupedResults[row.eco_name] = [];
      }

      groupedResults[row.eco_name].push({
        eco_name: row.eco_name,
        repo_name: row.repo_name,
        rn: Number(row.rn),
        score: Number(row.score),
      });
    }

    // Cache results for each ecosystem
    for (const [ecoName, list] of Object.entries(groupedResults)) {
      const cacheData = new EcoRankResult();
      cacheData.list = list;

      await this.cacheDataService.updateCacheData(
        CacheKey.EcoRepoRank,
        cacheData,
        new Date().toISOString(),
        ecoName,
      );
    }

    return groupedResults;
  }

  async EcoRank() {
    const sqlRawQuery = `
WITH repo_eco AS (SELECT r.repo_id,
                         e.key AS ecosystem_name
                  FROM data.repos r,
                       LATERAL jsonb_object_keys(r.upstream_marks) AS e(key)),

     active_dev_ids AS (SELECT re.ecosystem_name,
                               ev.actor_id
                        FROM repo_eco re
                                 JOIN data.events ev
                                      ON ev.repo_id = re.repo_id
                                          AND ev.created_at >= NOW() - INTERVAL '1 year'
                                          AND ev.event_type IN ('PullRequestEvent', 'PushEvent')
                        GROUP BY re.ecosystem_name, ev.actor_id
                        HAVING COUNT(DISTINCT ev.event_type) = 2),

     dev_per_eco AS (SELECT ecosystem_name,
                            COUNT(DISTINCT actor_id) AS dev_cnt
                     FROM active_dev_ids
                     GROUP BY ecosystem_name)

UPDATE data.ecosystems AS eco
SET score = dpe.dev_cnt
FROM dev_per_eco dpe
WHERE eco.name = dpe.ecosystem_name;
`;

    const query = CompiledQuery.raw(sqlRawQuery);
    const results = await this.db.executeQuery(query);

    console.log('Ecosystem rank updated:', results);
    return results;
  }

  @Command({
    command: 'sync:eco:rank',
    description: 'Test eco data',
  })
  async test() {
    const ecoTypes = await this.ecoService.getEcoNameFilters();
    await this.EcoRank();
    await this.getTopScoreActors(ecoTypes);
    await this.repoStarRank(ecoTypes);
    await this.ecoRankTotal(ECO_ALL, false);
    await this.get7daysTopStarRepos(ecoTypes);
    await this.get7daysDevelopersRank();
  }

  @Command({
    command: 'sync:eco:rank:new',
    description: 'Synchronize ecosystem repository ranking data',
  })
  async syncEcoRank() {
    const ecoTypes = await this.ecoService.getActiveEcoNames();
    await this.getEcoRepoRank(ecoTypes);
  }

  @Command({
    command: 'test:rank',
  })
  async test2() {
    // await this.get7daysTopStarRepos([ECO_ALL]);
    // await this.get7daysDevelopersRank();
    const ecoTypes = await this.ecoService.getActiveEcoNames();
    await this.getTopScoreActors(ecoTypes);
  }
}
