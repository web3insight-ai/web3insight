import { KYSELY, OCTOKIT } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { ActorsScopeType, EcoType } from '../dto/data.dto';
import { TotalService } from './total.services';
import type { Octokit as OctokitType } from '@octokit/rest';
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

@Injectable()
@Console()
export class RankService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;
  @Inject(OCTOKIT) private readonly github!: OctokitType;

  constructor(
    private cacheDataService: CacheDataService,
    private totalService: TotalService,
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
      const actorsTotalAllScopeResult = await this.totalService.actorsTotal(
        ecoName,
        ActorsScopeType.ALL,
      );

      const actorsTotalCoreScopeResult = await this.totalService.actorsTotal(
        ecoName,
        ActorsScopeType.Core,
      );

      const totalRepos = await this.totalService.reposTotal(ecoName);

      const actorsNewTotal = await this.totalService.getActorTotalNew(ecoName);

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

    return await this.cacheDataService.updateCacheData(
      CacheKey.EcoRank,
      cacheData,
      new Date().toISOString(),
    );
  }

  async getTopScoreActorsNew(ecoNames: string[]) {
    const sqlRawQuery = `
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
     contributor_pr_scores AS (SELECT event.actor_id,
                                      event.repo_id,
                                      COUNT(*) AS score
                               FROM web3.repos repos
                                        JOIN web3.event event ON repos.repo_id = event.repo_id
                               WHERE event.event_type = 'PullRequestEvent'
                                 AND repos.upstream_marks ?| (SELECT ARRAY_AGG(ecosystem_name) FROM ecosystem_list)
                               GROUP BY event.actor_id, event.repo_id),

     ecosystem_contributors AS (SELECT ecosystem.ecosystem_name AS ecosystem,
                                       cpc.actor_id,
                                       SUM(cpc.score)           AS total_score
                                FROM contributor_pr_scores cpc
                                         JOIN web3.repos repos ON cpc.repo_id = repos.repo_id
                                         CROSS JOIN ecosystem_list ecosystem
                                WHERE repos.upstream_marks ? ecosystem.ecosystem_name
                                GROUP BY ecosystem.ecosystem_name, cpc.actor_id),

     top_contributors_per_ecosystem AS (SELECT ecosystem,
                                               actor_id,
                                               total_score,
                                               ROW_NUMBER() OVER (PARTITION BY ecosystem ORDER BY total_score DESC) AS contributor_rank
                                        FROM ecosystem_contributors),
     ranked_repos_per_contributor AS (SELECT tc.ecosystem,
                                             tc.actor_id,
                                             tc.contributor_rank,
                                             tc.total_score,
                                             repos.repo_id,
                                             repos.repo_name,
                                             cpc.score,
                                             ROW_NUMBER()
                                             OVER (PARTITION BY tc.ecosystem, tc.actor_id ORDER BY cpc.score DESC) AS repo_rank
                                      FROM top_contributors_per_ecosystem tc
                                               JOIN contributor_pr_scores cpc ON tc.actor_id = cpc.actor_id
                                               JOIN web3.repos repos ON cpc.repo_id = repos.repo_id
                                      WHERE repos.upstream_marks ? tc.ecosystem
                                        AND tc.contributor_rank <= 10),
     contributors_with_repos AS (SELECT r.ecosystem,
                                        r.contributor_rank,
                                        r.actor_id,
                                        a.actor_login,
                                        r.total_score,
                                        json_agg(
                                        json_build_object(
                                                'repo_id', r.repo_id,
                                                'repo_name', r.repo_name,
                                                'score', r.score
                                        ) ORDER BY r.score DESC
                                                ) FILTER (WHERE r.repo_rank <= 100) AS top_repos

                                 FROM ranked_repos_per_contributor r
                                          JOIN web3.actors a ON r.actor_id = a.actor_id
                                 WHERE a.actor_login NOT ILIKE '%[bot]%'
                                   AND a.actor_login NOT ILIKE 'bot-%'
                                   AND a.actor_login NOT ILIKE '%-bot'
                                 GROUP BY r.ecosystem, r.contributor_rank, r.actor_id, a.actor_login, r.total_score)
SELECT ecosystem,
       json_agg(
               json_build_object(
                       'actor_id', actor_id,
                       'actor_login', actor_login,
                       'total_score', total_score,
                       'top_repos', top_repos
               ) ORDER BY contributor_rank
       ) AS top_contributors
FROM contributors_with_repos
GROUP BY ecosystem
ORDER BY ecosystem;
`;
    const query = CompiledQuery.raw(sqlRawQuery, [ecoNames]);

    const results = await this.db.executeQuery(query);

    for (const row of results.rows as QueryTopActors[]) {
      row.top_actors.forEach((actor) => {
        actor.total_commit_count = actor.total_score;
      });
      const cacheData = new ActorScoreRankListDto();
      cacheData.list = row.top_actors;
      await this.cacheDataService.updateCacheData(
        CacheKey.ActorScoreRank,
        row,
        new Date().toISOString(),
        row.ecosystem,
      );
    }
  }

  async repoStarRankNew(ecoNames: string[]) {
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
          const repoDetails = await this.github.rest.repos.get({
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
    await this.ecoRankTotal(EcoType.ALL, false);
    const ecoTypes = Object.values(EcoType);
    await this.repoStarRankNew(ecoTypes);
    await this.getTopScoreActorsNew(ecoTypes);
  }

  @Command({
    command: 'test:eco:rank',
  })
  async test2() {
    const ecoTypes = Object.values(EcoType);
    await this.repoStarRankNew(ecoTypes);
  }
}
