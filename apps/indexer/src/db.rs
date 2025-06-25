use anyhow::Result;
use chrono::{DateTime, Utc};
use dashmap::DashSet;
use rust_decimal::prelude::ToPrimitive;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use sqlx::Pool;
use sqlx::Postgres;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::sync::{LazyLock, OnceLock};

pub static DB_POOL: OnceLock<Pool<Postgres>> = OnceLock::new();

pub static ECO_REPO: LazyLock<DashSet<String>> = LazyLock::new(DashSet::new);

#[derive(sqlx::FromRow, Debug, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct EventTableStruct {
    pub id: u64,
    pub actor_id: u64,
    pub actor_login: String,
    pub repo_id: u64,
    pub repo_name: String,
    pub org_id: Option<u64>,
    pub org_login: Option<String>,
    pub event_type: String,
    pub payload: String,
    pub body: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow, Debug, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct ReposTableStruct {
    pub repo_id: i64,
    pub indexed: bool,
}

#[derive(sqlx::FromRow, Debug, Serialize, Deserialize, Default)]
#[allow(dead_code)]
pub struct TimeStruct {
    pub time: DateTime<Utc>,
}

pub async fn init_pg() -> Result<()> {
    match env::var("DATABASE_URL") {
        Ok(url) => match PgPoolOptions::new().connect(&url).await {
            Ok(pool) => {
                DB_POOL.set(pool).ok();
                tracing::info!("PostgreSQL connection initialized successfully");
            }
            Err(err) => {
                tracing::warn!(
                    "Failed to connect to PostgreSQL, skipping initialization: {}",
                    err
                );
            }
        },
        Err(err) => {
            tracing::warn!(
                "DATABASE_URL environment variable not found, skipping PostgreSQL initialization: {}",
                err
            );
        }
    }
    Ok(())
}

pub fn db_pool() -> Result<PgPool> {
    match DB_POOL.get() {
        Some(pool) => Ok(pool.clone()),
        None => Err(anyhow::anyhow!("Database pool not initialized")),
    }
}

impl EventTableStruct {
    fn vec<T, F>(chunk: &[EventTableStruct], f: F) -> Vec<T>
    where
        F: Fn(&EventTableStruct) -> T,
    {
        chunk.iter().map(f).collect()
    }

    #[tracing::instrument(skip(events))]
    pub async fn batch_insert_events_pg(
        events: Vec<EventTableStruct>,
        _path: &String,
    ) -> Result<()> {
        let chunk_size = events.len().min(100000);

        for chunk in events.chunks(chunk_size).filter(|c| !c.is_empty()) {
            let sql = "INSERT INTO data.events (
                id, actor_id, actor_login, repo_id, repo_name, org_id, org_login,
                event_type, payload, body, created_at
            )
            SELECT * FROM unnest(
                $1::bigint[], $2::bigint[], $3::text[], $4::bigint[], $5::text[],
                $6::bigint[], $7::text[], $8::text[], $9::json[], $10::text[],
                $11::timestamptz[]
            ) AS t(
                id, actor_id, actor_login, repo_id, repo_name, org_id, org_login,
                event_type, payload, body, created_at
            )
            ON CONFLICT (id, created_at) DO NOTHING";

            let _row = sqlx::query(sql)
                .bind(Self::vec(chunk, |data| data.id.to_i64()))
                .bind(Self::vec(chunk, |data| data.actor_id.to_i64()))
                .bind(Self::vec(chunk, |data| data.actor_login.clone()))
                .bind(Self::vec(chunk, |data| data.repo_id.to_i64()))
                .bind(Self::vec(chunk, |data| data.repo_name.clone()))
                .bind(Self::vec(chunk, |data| data.org_id.map(|id| id.to_i64())))
                .bind(Self::vec(chunk, |data| data.org_login.clone()))
                .bind(Self::vec(chunk, |data| data.event_type.clone()))
                .bind(Self::vec(chunk, |data| data.payload.clone()))
                .bind(Self::vec(chunk, |data| data.body.clone()))
                .bind(Self::vec(chunk, |data| data.created_at))
                .execute(&db_pool()?)
                .await?;
        }
        Ok(())
    }
}

impl ReposTableStruct {
    pub async fn init_repo_ids() -> Result<()> {
        let sql = "SELECT repo_id, indexed FROM data.repos;";
        let rows: Vec<ReposTableStruct> = sqlx::query_as(sql).fetch_all(&db_pool()?).await?;

        for row in rows {
            ECO_REPO.insert(row.repo_id.to_string());
        }
        Ok(())
    }

    pub async fn get_start_time() -> Result<TimeStruct> {
        let indexed_sql = "
SELECT MIN((api ->> 'created_at')::timestamptz) as time
FROM data.repos
WHERE indexed = false;";

        let indexed_row: Result<TimeStruct, sqlx::Error> =
            sqlx::query_as(indexed_sql).fetch_one(&db_pool()?).await;

        let last_sql = "
SELECT MAX(event_updated_at) as time
FROM data.repos;";

        let last_row: TimeStruct = sqlx::query_as(last_sql).fetch_one(&db_pool()?).await?;

        let min_allowed_time =
            DateTime::parse_from_rfc3339("2015-01-01T00:00:00Z")?.with_timezone(&Utc);

        let mut result = match indexed_row {
            Ok(row) => row,
            Err(_) => last_row,
        };

        if result.time < min_allowed_time {
            result.time = min_allowed_time;
        }

        Ok(result)
    }

    pub async fn update_indexed() -> Result<()> {
        let sql = "UPDATE data.repos SET indexed = true;";
        let result = sqlx::query(sql).execute(&db_pool()?).await?;
        let rows_affected = result.rows_affected();
        tracing::info!("Rows affected: {}", rows_affected);
        Ok(())
    }
}
