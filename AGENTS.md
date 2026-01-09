## 项目目的

分析 Github 开发者数据

## 项目构成

- TypeScript 语言，NestJS 框架。
- PostgreSQL 数据库，使用 Kysely（Kysely is the most powerful type-safe SQL query builder for TypeScript）连接查询。
- PNPM 包管理器

## 数据库表描述和注意

使用 SQL 完成复杂的数据分析工作，以下为注意事项：

1. 应该详细解释做了什么，按照执行顺序加入序号，描述每一个函数，方法步骤。
2. data.events 表对应 gharchive 数据集存储 github event 事件。
3. data.repos 表为原始筛选条件，upstream_marks 是 jsonb 列，第一级 key 对应各个生态。当使用生态为查询条件时从 upstream_marks 筛选。
4. data.actors 表为用户表，存储用户 id 和对应的最新的 actor_login。
5. data.repos 表为仓库表，存储仓库 id 和对应最新的 repo_name。
6. 在查询时如果需要，必须使用 repo_id 参数，通过 repos 表获取最新的 repo_name。
7. 在查询时如果需要，必须使用 actor_id 参数，通过 actors 表获取最新的 actor_login。
8. 在涉及到复杂查询时尽量避免嵌套低效查询，PostgreSQL Common Table Expression (CTE) 是更好的替代方案。根据复杂度选择是否使用。
9. 请注意 events 是一个有 100 亿条数据的超级大表，所有查询必须首先考虑此注意事项。
10. 如果指出需要查询多个生态，请使用这个作为首行查询条件: WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
11. 为了保持字段一致性，repos 中 created_at 为 repo 最后更新时间。


## SQL 注意

将自然语言转换为对应的 SQL 查询语句。遵循以下步骤:
1. 仔细理解输入的自然语言描述，识别分析意图，并核对查询所需的表名、字段名、条件和操作。按照 PostgreSQL SQL 语法生成查询语句，确保生成的 SQL 语句语法正确且完。
2. 仅考虑 PostgreSQL 兼容性，PostgreSQL 使用最新版本。
3. 不要对 SQL 简写，保持可读性。

## 重要文件路径

- `src/app/db/dto/db.dto.ts` 本文件为数据库表结构定义
