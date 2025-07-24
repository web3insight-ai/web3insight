import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CompiledQuery, Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { CacheKey } from '../dto/cache.dto';
import { EcoType } from '../dto/data.dto';

// 定义返回数据结构
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
export class EcoRankService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(
    private cacheDataService: CacheDataService,
  ) {}

  /**
   * 获取生态系统仓库排名数据
   * @param ecoNames 生态系统名称列表
   */
  async getEcoRank(ecoNames: string[]) {
    // 原始SQL查询逻辑
    const sqlRawQuery = `
      WITH
      -- 需要分析的生态
      eco_list as (
          select distinct
              unnest($1::text[]) as eco_name
      ),
      -- 活跃开发者：近 1 年内 PR 提交月数大于等于 9 个月的开发者
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
      -- 统计仓库近 1 年的事件：活跃开发者人数、非活跃开发者人数、活跃开发者提交次数、非活跃开发者提交次数、star 数、fork 数
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
      -- 聚合仓库所属生态和所属生态数量
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
      -- 计算仓库得分：
      -- - 使用饱和函数对统计量进行处理
      -- - 仓库连接数和开发者数量的权重大于行为的权重
      -- - 如果一个项目属于多个生态，则对其进行指数衰减：$e^{-0.3 * (eco\_num - 1)}$
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

    // 按生态系统分组结果
    const groupedResults: { [key: string]: EcoRankItem[] } = {};
    
    for (const row of results.rows as any[]) {
      if (!groupedResults[row.eco_name]) {
        groupedResults[row.eco_name] = [];
      }
      
      groupedResults[row.eco_name].push({
        eco_name: row.eco_name,
        repo_name: row.repo_name,
        rn: Number(row.rn),
        score: Number(row.score)
      });
    }

    // 为每个生态系统缓存结果
    for (const [ecoName, list] of Object.entries(groupedResults)) {
      const cacheData = new EcoRankResult();
      cacheData.list = list;
      
      await this.cacheDataService.updateCacheData(
        CacheKey.EcoRank,
        cacheData,
        new Date().toISOString(),
        ecoName
      );
    }

    return groupedResults;
  }

  @Command({
    command: 'sync:eco:rank:new',
    description: '同步生态系统仓库排名数据',
  })
  async syncEcoRank() {
    // 获取所有生态系统类型（排除ALL）
    const ecoTypes = Object.values(EcoType).filter(
      (eco) => eco !== EcoType.ALL,
    );
    
    await this.getEcoRank(ecoTypes);
    console.log('Eco rank data synced successfully');
  }
}