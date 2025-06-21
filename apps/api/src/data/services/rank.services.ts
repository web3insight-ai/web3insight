import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { EcoType } from '../dto/data.dto';
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
import { TokenPoolService } from '@/app/db/pool.services';

@Injectable()
@Console()
export class RankService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(
    private cacheDataService: CacheDataService,
    private tokenPoolService: TokenPoolService,
  ) {}

  async ecoRankTotal(ecoName: EcoType, cache: boolean = true) {
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

    const ecoTypes = Object.values(EcoType).filter(
      (eco) => eco !== EcoType.ALL,
    );
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

      data.push({
        eco_name: ecoName,
        actors_total: (actorsTotalAllScopeResult?.cache_data as TotalDto).total,
        actors_new_total: (actorsNewTotal?.cache_data as TotalDto).total,
        actors_core_total: (actorsTotalCoreScopeResult?.cache_data as TotalDto)
          .total,
        repos_total: (totalRepos?.cache_data as TotalDto).total,
      });
    }

    data.sort((a, b) => b.actors_total - a.actors_total);

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
     filtered_events AS (SELECT event.actor_id,
                                event.repo_id,
                                COUNT(*) AS score
                         FROM web3.repos repos
                                  JOIN web3.event event ON repos.repo_id = event.repo_id
                         WHERE event.event_type = 'PullRequestEvent'
                           AND repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name) FROM ecosystem_list)
                         GROUP BY event.actor_id, event.repo_id),

     ecosystem_scores AS (SELECT e.ecosystem_name AS ecosystem,
                                 fe.actor_id,
                                 fe.repo_id,
                                 repos.repo_name,
                                 fe.score
                          FROM filtered_events fe
                                   JOIN web3.repos repos ON fe.repo_id = repos.repo_id
                                   CROSS JOIN ecosystem_list e
                          WHERE repos.upstream_marks ? e.ecosystem_name),

     actor_totals AS (SELECT es.ecosystem,
                             es.actor_id,
                             a.actor_login,
                             SUM(es.score)                                                             AS total_score,
                             ROW_NUMBER() OVER (PARTITION BY es.ecosystem ORDER BY SUM(es.score) DESC) AS rank
                      FROM ecosystem_scores es
                               JOIN web3.actors a ON es.actor_id = a.actor_id
                      WHERE a.actor_login NOT ILIKE '%[bot]%'
                        AND a.actor_login NOT ILIKE 'bot-%'
                        AND a.actor_login NOT ILIKE '%-bot'
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
     repo_stars AS (SELECT event.repo_id,
                           COUNT(DISTINCT event.actor_id) star_count
                    FROM web3.repos repos
                             JOIN web3.event event ON repos.repo_id = event.repo_id
                    WHERE event.event_type = 'WatchEvent'
                      AND repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name)
                                                   FROM ecosystem_list)
                    GROUP BY event.repo_id),
     repo_contributors AS (SELECT event.repo_id,
                                  COUNT(DISTINCT event.actor_id) contributor_count
                           FROM web3.repos repos
                                    JOIN web3.event event ON repos.repo_id = event.repo_id
                           WHERE event.event_type IN ('PushEvent', 'PullRequestEvent')
                             AND repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name)
                                                          FROM ecosystem_list)
                           GROUP BY event.repo_id),
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
                                JOIN web3.repos repos ON repo_stars.repo_id = repos.repo_id
                                CROSS JOIN ecosystem_list ecosystem
                                LEFT JOIN repo_contributors rc ON repo_stars.repo_id = rc.repo_id
                       WHERE repos.upstream_marks ? ecosystem.ecosystem_name)
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
WHERE ranking <= 10
GROUP BY ecosystem
ORDER BY ecosystem;`;

    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryTopStar[]) {
      const data: QueryTopStarRepo[] = await Promise.all(
        row.top_repositories.map(async (row) => {
          const [owner, repo] = row.repo_name.split('/');
          const client = await this.tokenPoolService.getClient();
          const repoDetails = await client.rest.repos.get({
            owner,
            repo,
          });
          return {
            repo_id: Number(row.repo_id),
            repo_name: row.repo_name,
            star_count: repoDetails.data.stargazers_count,
            forks_count: repoDetails.data.forks_count,
            contributor_count: row.contributor_count,
            open_issues_count: repoDetails.data.open_issues_count,
          };
        }),
      );
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

  @Command({
    command: 'sync:eco:rank',
    description: 'Test eco data',
  })
  async test() {
    const ecoTypes = Object.values(EcoType);
    await this.getTopScoreActors(ecoTypes);
    await this.repoStarRank(ecoTypes);
    await this.ecoRankTotal(EcoType.ALL, false);
  }

  @Command({
    command: 'test:eco:rank',
  })
  async test2() {}
}
