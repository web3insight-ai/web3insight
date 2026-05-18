# Web3Insights

<p align="center">
  <img src="https://img.shields.io/badge/language-Rust-orange.svg" alt="Language">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
</p>

Web3Insights is a data lake indexer designed to analyze GitHub events. It efficiently downloads, processes, and stores GitHub event data from GHArchive, making it accessible for further analysis and insights.

## 🚀 Features

- **Efficient Data Processing**: Downloads and processes GitHub event data from GHArchive
- **Advanced Data Lake Architecture**:
  - Store data in DuckDB for local analysis
  - PostgreSQL integration with Apache Iceberg via pg_mooncake extension
- **Configurable Processing**:
  - Filter bot accounts, event bodies, and payloads
  - Adjustable concurrency for file processing and database operations
  - Flexible time range selection for targeted data collection

## 📋 Requirements

- Rust (2024 edition)
- PostgreSQL with pg_mooncake extension (optional)
- Internet connection (for downloading GitHub event data)

## 🔧 Installation & Usage

1. **Setup**:

   ```bash
   git clone https://github.com/Web3Insights/web3insights.git
   cd web3insights
   cp .env.example .env  # Edit with your configuration
   ```

2. **Run**:

   ```bash
   cargo run --release
   ```

   ```bash
   cargo build --release
   ```

   Note:
   If use x86_64 cpu，enable modern cpu optimization:

   ```bash
   RUSTFLAGS='-C target-cpu=x86-64-v4' cargo run --release
   ```

   ```bash
   RUSTFLAGS='-C target-cpu=x86-64-v4' cargo build --release
   ```

3. **Process Flow**:
   - Downloads GitHub event data from GHArchive for the specified time range
   - Processes and filters events according to your configuration
   - Stores data in selected database(s) (DuckDB and/or PostgreSQL with Iceberg)

## ⚙️ Configuration

| Variable              | Description                                    | Default                                                         |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string                   | `postgresql://web3insights:web3insights@localhost/web3insights` |
| `FILTER_OUT_PAYLOAD`  | Whether to filter out event payloads           | `true`                                                          |
| `FILTER_OUT_BODY`     | Whether to filter out event bodies             | `true`                                                          |
| `FILTER_OUT_BOT`      | Whether to filter out bot accounts             | `false`                                                         |
| `MAX_FILE_CONCURRENT` | Maximum concurrent file processing             | `12`                                                            |
| `MAX_DB_CONCURRENT`   | Maximum concurrent database operations         | `4`                                                             |
| `DB_SELECT`           | Database selection (`duckdb`, `pg`, or `both`) | `duckdb`                                                        |
| `TIME_START`          | Start time for event processing                | `2020-01-01T00:00:00Z`                                          |
| `TIME_END`            | End time for event processing                  | `2020-02-01T00:00:00Z`                                          |
| `GHARCHIVE_FILE_PATH` | Path to store GHArchive files                  | `./gharchive`                                                   |

## 📊 Data Storage and Analysis

### DuckDB for Analytics

When using DuckDB (`DB_SELECT=duckdb` or `DB_SELECT=both`), Web3Insights leverages DuckDB's powerful analytical capabilities:

- **Key Benefits**:
  - **High Performance Analytics**: Exceptional query performance for analytical workloads
  - **Column-Oriented Storage**: Optimized for analytical queries with efficient data compression
  - **Zero-ETL Analytics**: Directly query data in various formats without transformation
  - **Native File Format Support**: Directly read and write Parquet, CSV, JSON and other formats
  - **SQL Interface**: Familiar SQL syntax with rich analytical functions
  - **Lightweight & Embeddable**: Zero configuration, single-file database with minimal footprint
  - **Vectorized Execution**: SIMD-accelerated processing for maximum throughput
  - **Parallel Query Execution**: Efficient utilization of multi-core processors
  - **Data Science Integration**: Seamless integration with Python, R, and other tools
  - **Cross-Platform Compatibility**: Works on all major operating systems
  - **Iceberg Support**: Capable of reading Apache Iceberg tables

### PostgreSQL with Apache Iceberg

When using PostgreSQL (`DB_SELECT=pg` or `DB_SELECT=both`), Web3Insights leverages the pg_mooncake extension to store data using Apache Iceberg:

- **pg_mooncake Extension**: Provides Apache Iceberg integration for PostgreSQL

  - GitHub: [pg_mooncake](https://github.com/Mooncake-Labs/pg_mooncake)
  - Related: [moonlink](https://github.com/Mooncake-Labs/moonlink)

### Data Model

GitHub event data is stored using the following schema:

| Field         | Type      | Description                       |
| ------------- | --------- | --------------------------------- |
| `id`          | BIGINT    | Event ID                          |
| `actor_id`    | BIGINT    | GitHub user ID                    |
| `actor_login` | TEXT      | GitHub username                   |
| `repo_id`     | BIGINT    | Repository ID                     |
| `repo_name`   | TEXT      | Repository name                   |
| `org_id`      | BIGINT    | Organization ID (if applicable)   |
| `org_login`   | TEXT      | Organization name (if applicable) |
| `event_type`  | TEXT      | Type of GitHub event              |
| `payload`     | JSON      | Event payload data                |
| `body`        | TEXT      | Event body content                |
| `created_at`  | TIMESTAMP | Event creation time               |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌐 Languages

- [English](README.md)
- [中文](README_CN.md)
