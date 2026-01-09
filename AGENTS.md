## 目标

分析 GitHub 开发者数据，生成 SQL 或 Kysely 查询。

## 技术栈

- TypeScript + NestJS
- PostgreSQL + Kysely
- PNPM

## 输出规范（AI 必须遵循）

1. 解释“做了什么”，按执行顺序编号。
2. 每个函数、方法、步骤都要覆盖到。
3. SQL 语句完整、可读，不做简写。
4. 使用简体中文回复。

## 数据库 data schema（SQL 分析规则）

1. data.events 表对应 gharchive 数据集的 GitHub event 事件。
2. data.repos 表为原始筛选条件，upstream_marks 为 jsonb 列，第一级 key 对应各个生态；按生态筛选时从 upstream_marks 过滤。
3. data.actors 表为用户表，存储 actor_id 与最新 actor_login。
4. data.repos 表为仓库表，存储 repo_id 与最新 repo_name。
5. 需要 repo_name 时必须使用 repo_id，并通过 repos 表获取最新 repo_name。
6. 需要 actor_login 时必须使用 actor_id，并通过 actors 表获取最新 actor_login。
7. 复杂查询避免低效嵌套，优先使用 PostgreSQL CTE。
8. events 是 100 亿级超大表，任何查询必须首先考虑性能。
9. 查询多个生态时，首行必须使用：
   WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name),
10. 字段一致性：repos.created_at 表示 repo 的最后更新时间。

### SQL 生成步骤

1. 先理解自然语言需求，确认表、字段、条件与聚合逻辑。
2. 仅使用 PostgreSQL 最新版本语法。
3. 输出可执行的完整 SQL。

## 数据库 api schema（业务查询规则）

1. 优先使用 Kysely 查询构建器完成功能。
2. api.auth_users 为用户表。
3. api.auth_users_binds 为用户授权绑定表，目前使用 privy 第三方管理授权。

## 重要文件

- `src/app/db/dto/db.dto.ts` 数据库表结构定义
