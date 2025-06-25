use anyhow::Result;
use chrono::{DateTime, Utc};
use rust_decimal::prelude::ToPrimitive;
use serde::{Deserialize, Serialize};
use sqlx::Pool;
use sqlx::Postgres;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::sync::OnceLock;

pub static DB_POOL: OnceLock<Pool<Postgres>> = OnceLock::new();

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

impl EventTableStruct {
    fn collect<T, F>(chunk: &[EventTableStruct], f: F) -> Vec<T>
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
            let sql = "INSERT INTO web3.event (
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
                .bind(&Self::collect(chunk, |data| data.id.to_i64()))
                .bind(&Self::collect(chunk, |data| data.actor_id.to_i64()))
                .bind(&Self::collect(chunk, |data| data.actor_login.clone()))
                .bind(&Self::collect(chunk, |data| data.repo_id.to_i64()))
                .bind(&Self::collect(chunk, |data| data.repo_name.clone()))
                .bind(&Self::collect(chunk, |data| {
                    data.org_id.map(|id| id.to_i64())
                }))
                .bind(&Self::collect(chunk, |data| data.org_login.clone()))
                .bind(&Self::collect(chunk, |data| data.event_type.clone()))
                .bind(&Self::collect(chunk, |data| data.payload.clone()))
                .bind(&Self::collect(chunk, |data| data.body.clone()))
                .bind(&Self::collect(chunk, |data| data.created_at))
                .execute(
                    DB_POOL
                        .get()
                        .ok_or(anyhow::anyhow!("DB_POOL not initialized"))?,
                )
                .await?;
        }
        Ok(())
    }
}
