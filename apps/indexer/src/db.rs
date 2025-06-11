use anyhow::Result;
use chrono::{DateTime, Utc};
use duckdb::{Connection, params};
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

pub async fn init_duckdb() -> Result<Connection> {
    let db_path = env::var("DUCKDB_PATH").unwrap_or_else(|_| "events.db".to_string());
    let conn = Connection::open(&db_path)?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS events (
            id UBIGINT NOT NULL,
            actor_id UBIGINT NOT NULL,
            actor_login TEXT NOT NULL,
            repo_id UBIGINT NOT NULL,
            repo_name TEXT NOT NULL,
            org_id UBIGINT,
            org_login TEXT,
            event_type TEXT NOT NULL,
            payload JSON NOT NULL,
            body TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL
        )",
    )?;
    Ok(conn)
}

pub async fn init_pg() -> Result<()> {
    let pool = PgPoolOptions::new()
        .connect(env::var("DATABASE_URL")?.as_str())
        .await?;
    DB_POOL.set(pool).ok();
    Ok(())
}

impl EventTableStruct {
    #[tracing::instrument(skip(events))]
    pub async fn batch_insert_events_duckdb(
        conn: &mut Connection,
        events: &Vec<EventTableStruct>,
        _path: &String,
    ) -> Result<()> {
        if events.is_empty() {
            return Ok(());
        }
        let mut app = conn.appender("events")?;

        for event in events {
            app.append_row(params![
                event.id,
                event.actor_id,
                &event.actor_login,
                event.repo_id,
                &event.repo_name,
                event.org_id,
                event.org_login.as_ref(),
                &event.event_type,
                &event.payload,
                event.body.as_ref(),
                &event.created_at.to_rfc3339(),
            ])?;
        }

        Ok(())
    }

    #[tracing::instrument(skip(events))]
    pub async fn batch_insert_events_pg(
        events: Vec<EventTableStruct>,
        _path: &String,
    ) -> Result<()> {
        if events.is_empty() {
            return Ok(());
        }

        let chunk_size = if events.len() > 20000 {
            10000
        } else {
            events.len()
        };

        for chunk in events.chunks(chunk_size) {
            if chunk.is_empty() {
                continue;
            }

            let mut ids = Vec::with_capacity(chunk.len());
            let mut actor_ids = Vec::with_capacity(chunk.len());
            let mut actor_logins = Vec::with_capacity(chunk.len());
            let mut repo_ids = Vec::with_capacity(chunk.len());
            let mut repo_names = Vec::with_capacity(chunk.len());
            let mut org_ids = Vec::with_capacity(chunk.len());
            let mut org_logins = Vec::with_capacity(chunk.len());
            let mut event_types = Vec::with_capacity(chunk.len());
            let mut payloads = Vec::with_capacity(chunk.len());
            let mut bodies = Vec::with_capacity(chunk.len());
            let mut created_ats = Vec::with_capacity(chunk.len());

            for data in chunk {
                ids.push(data.id.to_i64());
                actor_ids.push(data.actor_id.to_i64());
                actor_logins.push(data.actor_login.clone());
                repo_ids.push(data.repo_id.to_i64());
                repo_names.push(data.repo_name.clone());
                org_ids.push(data.org_id.map(|id| id as i64));
                org_logins.push(data.org_login.clone());
                event_types.push(data.event_type.clone());
                payloads.push(data.payload.clone());
                bodies.push(data.body.clone());
                created_ats.push(data.created_at);
            }

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
                .bind(&ids)
                .bind(&actor_ids)
                .bind(&actor_logins)
                .bind(&repo_ids)
                .bind(&repo_names)
                .bind(&org_ids)
                .bind(&org_logins)
                .bind(&event_types)
                .bind(&payloads)
                .bind(&bodies)
                .bind(&created_ats)
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
