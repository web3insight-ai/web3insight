use anyhow::Result;
use chrono::{DateTime, Duration, Utc};
use dotenvy::dotenv;
use duckdb::{Connection, params};
use flate2::read::GzDecoder;
use octocrab::models::events::Event;
use octocrab::models::events::payload::EventPayload::{
    CommitCommentEvent, IssueCommentEvent, IssuesEvent, PullRequestEvent,
    PullRequestReviewCommentEvent, ReleaseEvent,
};
use rust_decimal::Decimal;
use rust_decimal::prelude::*;
use std::env;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::time::Instant;
use tokio::sync::mpsc;
use tokio::task::JoinSet;
use tracing::level_filters::LevelFilter;
use tracing_subscriber::{
    Layer,
    fmt::{self, format::FmtSpan},
    layer::SubscriberExt,
    util::SubscriberInitExt,
};

#[derive(Debug)]
#[allow(dead_code)]
struct EventTableStruct {
    id: u64,
    actor_id: u64,
    actor_login: String,
    repo_id: u64,
    repo_name: String,
    org_id: Option<u64>,
    org_login: Option<String>,
    event_type: String,
    payload: String,
    body: Option<String>,
    created_at: DateTime<Utc>,
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv()?;

    let start = Instant::now();

    let console = fmt::Layer::new()
        .with_span_events(FmtSpan::CLOSE)
        .pretty()
        .with_filter(LevelFilter::INFO);

    tracing_subscriber::registry().with(console).init();

    let files = load_gh_path(
        "/bpool-1/gharchive/data",
        "2025-01-01T00:00:00Z",
        "2025-02-01T00:00:00Z",
    )?;

    let db = connect_db().await?;

    let (tx, mut rx) = mpsc::channel(2);

    let mut test = db.try_clone()?;

    let db_handle = tokio::spawn(async move {
        while let Some((_path, content)) = rx.recv().await {
            batch_insert_events(&mut test, &content).await.unwrap();
        }
    });

    run_task(files, tx).await?;

    db_handle.await?;

    let duration = start.elapsed();

    tracing::info!("Total time elapsed: {:?}", duration);

    Ok(())
}

async fn connect_db() -> Result<Connection> {
    let db_path = env::var("DUCKDB_PATH").unwrap_or_else(|_| "gh_events.db".to_string());
    let conn = Connection::open(&db_path)?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS gh_events (
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

#[tracing::instrument(skip(events))]
async fn batch_insert_events(conn: &mut Connection, events: &Vec<EventTableStruct>) -> Result<()> {
    if events.is_empty() {
        return Ok(());
    }

    let mut tx = conn.transaction()?;
    tx.set_drop_behavior(duckdb::DropBehavior::Commit);
    let mut app = tx.appender("gh_events")?;

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

async fn run_task(
    files: Vec<PathBuf>,
    tx: mpsc::Sender<(String, Vec<EventTableStruct>)>,
) -> Result<()> {
    let mut tasks = JoinSet::new();

    let max_concurrent = env::var("MAX_CONCURRENT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(4);

    for path in files {
        let path_str = path.to_string_lossy().to_string();

        let file_tx = tx.clone();

        if tasks.len() >= max_concurrent {
            tasks.join_next().await;
        }
        tasks.spawn(async move {
            let event = load_gh_event(path).await;
            file_tx.send((path_str, event.unwrap())).await.unwrap();
        });
    }

    while let Some(result) = tasks.join_next().await {
        result?;
    }

    drop(tx);

    Ok(())
}

fn load_gh_path(base: &str, start: &str, end: &str) -> Result<Vec<PathBuf>> {
    let start_time = DateTime::parse_from_rfc3339(start)?.with_timezone(&Utc);
    let end_time = DateTime::parse_from_rfc3339(end)?.with_timezone(&Utc);

    let timt_vec = (0..=end_time.signed_duration_since(start_time).num_hours())
        .map(|h| {
            PathBuf::from(base).join(
                (start_time + Duration::hours(h))
                    .format("%Y/%m/%Y-%m-%d-%-H.json.gz")
                    .to_string(),
            )
        })
        .collect();

    Ok(timt_vec)
}

#[tracing::instrument]
async fn load_gh_event(file_path: PathBuf) -> Result<Vec<EventTableStruct>> {
    let file = File::open(file_path)?;
    let decoder = GzDecoder::new(file);
    let reader = BufReader::with_capacity(10 * 1024 * 1024, decoder);

    let batch: Vec<EventTableStruct> = reader
        .lines()
        .map_while(Result::ok)
        .filter_map(|line| match serde_json::from_str::<Event>(&line) {
            Ok(event) => Some(event),
            Err(e) => {
                tracing::error!("Failed to load event: {}", e);
                None
            }
        })
        .filter_map(format_event_module)
        .collect();
    Ok(batch)
}

fn format_event_module(event: Event) -> Option<EventTableStruct> {
    let filter_out_payload =
        env::var("FILTER_OUT_PAYLOAD").is_ok_and(|v| v.to_lowercase() == "true");
    let filter_out_body = env::var("FILTER_OUT_BODY").is_ok_and(|v| v.to_lowercase() == "true");
    let filter_out_bot = env::var("FILTER_OUT_BOT").is_ok_and(|v| v.to_lowercase() == "true");

    let actor = event.actor.clone();

    if filter_out_bot
        && [
            "[bot]", "-bot", "_bot", "-ci", "_ci", "-action", "_action", "-actions", "_actions",
        ]
        .iter()
        .any(|suffix| actor.login.ends_with(suffix))
    {
        return None;
    }

    let body_raw = match event.payload.clone() {
        Some(data) => match data.specific {
            Some(IssuesEvent(payload)) => payload.issue.body,
            Some(IssueCommentEvent(payload)) => payload.comment.body,
            Some(CommitCommentEvent(payload)) => payload.comment.body,
            Some(PullRequestEvent(payload)) => payload.pull_request.body,
            Some(PullRequestReviewCommentEvent(payload)) => payload.comment.body,
            Some(ReleaseEvent(payload)) => payload.release.body,
            _ => None,
        },
        None => None,
    };

    let body = if !filter_out_body {
        body_raw.map(|b| {
            b.chars()
                .filter(|&c| !c.is_control() || c.is_whitespace())
                .collect()
        })
    } else {
        None
    };

    let payload = if filter_out_payload {
        String::from("{}")
    } else {
        serde_json::to_string(&event.payload).unwrap_or_default()
    };

    let event_struct = EventTableStruct {
        id: Decimal::from_str(&event.id)
            .unwrap_or(Decimal::zero())
            .to_u64()
            .unwrap_or(0),
        actor_id: *event.actor.id,
        actor_login: event.actor.login,
        repo_id: *event.repo.id,
        repo_name: event.repo.name,
        org_id: event.org.as_ref().map(|org| *org.id),
        org_login: event.org.as_ref().map(|org| org.login.clone()),
        event_type: event.r#type.to_string(),
        body,
        payload: payload,
        created_at: event.created_at,
    };
    Some(event_struct)
}
