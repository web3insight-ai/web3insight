# Web3Insights

<p align="center">
  <img src="https://img.shields.io/badge/language-Rust-orange.svg" alt="语言">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="许可证">
</p>

Web3Insights 是一个数据湖索引器，专为分析 GitHub 事件而设计。它能高效地从 GHArchive 下载、处理和存储 GitHub 事件数据，使其可用于进一步分析和洞察。

## 🚀 特性

- **高效数据处理**：从 GHArchive 下载并处理 GitHub 事件数据
- **先进的数据湖架构**：
  - 使用 DuckDB 进行本地分析
  - 通过 pg_mooncake 扩展实现 PostgreSQL 与 Apache Iceberg 的集成
- **可配置处理**：
  - 过滤机器人账户、事件正文和有效载荷
  - 可调整的文件处理和数据库操作并发性
  - 灵活的时间范围选择，用于有针对性的数据收集

## 📋 要求

- Rust（2024 版本）
- 安装 pg_mooncake 扩展的 PostgreSQL（可选）
- 互联网连接（用于下载 GitHub 事件数据）

## 🔧 安装与使用

1. **设置**：

   ```bash
   git clone https://github.com/yourusername/web3insights.git
   cd web3insights
   cp .env.example .env  # 编辑配置
   cargo build --release
   ```

2. **运行**：

   ```bash
   cargo run --release
   ```

3. **处理流程**：
   - 从 GHArchive 下载指定时间范围内的 GitHub 事件数据
   - 根据您的配置处理和过滤事件
   - 将数据存储在所选数据库中（DuckDB 和/或带有 Iceberg 的 PostgreSQL）

## ⚙️ 配置

| 变量                  | 描述                                   | 默认值                                                          |
| --------------------- | -------------------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL 连接字符串                  | `postgresql://web3insights:web3insights@localhost/web3insights` |
| `FILTER_OUT_PAYLOAD`  | 是否过滤事件有效载荷                   | `true`                                                          |
| `FILTER_OUT_BODY`     | 是否过滤事件正文                       | `true`                                                          |
| `FILTER_OUT_BOT`      | 是否过滤机器人账户                     | `false`                                                         |
| `MAX_FILE_CONCURRENT` | 最大并发文件处理数                     | `12`                                                            |
| `MAX_DB_CONCURRENT`   | 最大并发数据库操作数                   | `4`                                                             |
| `DB_SELECT`           | 数据库选择（`duckdb`、`pg` 或 `both`） | `duckdb`                                                        |
| `TIME_START`          | 事件处理的开始时间                     | `2020-01-01T00:00:00Z`                                          |
| `TIME_END`            | 事件处理的结束时间                     | `2020-02-01T00:00:00Z`                                          |
| `GHARCHIVE_FILE_PATH` | 存储 GHArchive 文件的路径              | `./gharchive`                                                   |

## 📊 数据存储与分析

### 用于分析的 DuckDB

当使用 DuckDB（`DB_SELECT=duckdb` 或 `DB_SELECT=both`）时，Web3Insights 利用 DuckDB 强大的分析能力：

- **主要优势**：
  - **高性能分析**：针对分析工作负载的卓越查询性能
  - **列式存储**：针对分析查询优化，具有高效的数据压缩
  - **零 ETL 分析**：无需转换，直接查询各种格式的数据
  - **原生文件格式支持**：直接读写 Parquet、CSV、JSON 和其他格式
  - **SQL 接口**：使用熟悉的 SQL 语法，具有丰富的分析函数
  - **轻量级与可嵌入**：零配置，单文件数据库，占用资源极少
  - **向量化执行**：SIMD 加速处理，实现最大吞吐量
  - **并行查询执行**：高效利用多核处理器
  - **数据科学集成**：与 Python、R 和其他工具无缝集成
  - **跨平台兼容性**：适用于所有主要操作系统
  - **Iceberg 支持**：能够读取 Apache Iceberg 表

### 带有 Apache Iceberg 的 PostgreSQL

当使用 PostgreSQL（`DB_SELECT=pg` 或 `DB_SELECT=both`）时，Web3Insights 利用 pg_mooncake 扩展使用 Apache Iceberg 表格式存储数据：

- **pg_mooncake 扩展**：为 PostgreSQL 提供 Apache Iceberg 集成

  - GitHub：[pg_mooncake](https://github.com/Mooncake-Labs/pg_mooncake)
  - 相关：[moonlink](https://github.com/Mooncake-Labs/moonlink)

### 数据模型

GitHub 事件数据使用以下架构存储：

| 字段          | 类型      | 描述               |
| ------------- | --------- | ------------------ |
| `id`          | BIGINT    | 事件 ID            |
| `actor_id`    | BIGINT    | GitHub 用户 ID     |
| `actor_login` | TEXT      | GitHub 用户名      |
| `repo_id`     | BIGINT    | 仓库 ID            |
| `repo_name`   | TEXT      | 仓库名称           |
| `org_id`      | BIGINT    | 组织 ID（如适用）  |
| `org_login`   | TEXT      | 组织名称（如适用） |
| `event_type`  | TEXT      | GitHub 事件类型    |
| `payload`     | JSON      | 事件有效载荷数据   |
| `body`        | TEXT      | 事件正文内容       |
| `created_at`  | TIMESTAMP | 事件创建时间       |

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📜 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。

## 🌐 语言

- [English](README.md)
- [中文](README_CN.md)
