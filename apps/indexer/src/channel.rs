use crate::db::{EventTableStruct, init_duckdb, init_pg};
use anyhow::Result;
use chrono::{DateTime, Duration, Utc};
use flate2::read::GzDecoder;
use octocrab::models::events::Event;
use octocrab::models::events::payload::EventPayload::{
    CommitCommentEvent, IssueCommentEvent, IssuesEvent, PullRequestEvent,
    PullRequestReviewCommentEvent, ReleaseEvent,
};
use rust_decimal::Decimal;
use rust_decimal::prelude::*;
use std::env;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use tokio::fs;
use tokio::fs::File;
use tokio::process::Command;
use tokio::task::JoinSet;

pub async fn start_channel() -> Result<()> {
    let start = env::var("TIME_START").unwrap_or_else(|_| "2020-01-01T00:00:00Z".to_string());
    let end = env::var("TIME_END").unwrap_or_else(|_| "2020-02-01T00:00:00Z".to_string());
    let file_path = env::var("GHARCHIVE_FILE_PATH").unwrap_or_else(|_| "./gharchive".to_string());

    let files = load_gh_path(file_path.as_str(), start.as_str(), end.as_str())?;

    let (tx, rx) = tokio_mpmc::channel(48);

    let max_concurrent = env::var("MAX_DB_CONCURRENT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(4);

    let duckdb = init_duckdb().await?;

    duckdb.execute("CALL start_ui();", [])?;

    init_pg().await?;

    let mut consumers = JoinSet::new();

    for _ in 0..max_concurrent {
        let mut db = duckdb.try_clone().unwrap();
        let rx = rx.clone();

        consumers.spawn(async move {
            loop {
                match rx.recv().await {
                    Ok(Some((path, events))) => {
                        let db_select = env::var("DB_SELECT")
                            .unwrap_or("duckdb".to_string())
                            .to_lowercase();

                        if db_select == "both" || db_select == "duckdb" {
                            EventTableStruct::batch_insert_events_duckdb(&mut db, &events, &path)
                                .await
                                .map_err(|_| {
                                    tracing::error!("Error inserting into DuckDB, Path: {:?}", path)
                                })
                                .ok();
                        }

                        if db_select == "both" || db_select == "pg" {
                            EventTableStruct::batch_insert_events_pg(events, &path)
                                .await
                                .map_err(|_| {
                                    tracing::error!(
                                        "Error inserting into PostgreSQL, Path: {:?}",
                                        path
                                    )
                                })
                                .ok();
                        }
                    }
                    Ok(None) => {
                        tracing::info!("DB Channel closed, exiting");
                        break;
                    }
                    Err(e) => {
                        tracing::error!("DB Channel error receiving value: {:?}", e);
                        break;
                    }
                }
            }
        });
    }

    read_file_tx(files, tx).await?;

    while let Some(Ok(_)) = consumers.join_next().await {}

    Ok(())
}

fn load_gh_path(base: &str, start: &str, end: &str) -> Result<Vec<PathBuf>> {
    let start_time = DateTime::parse_from_rfc3339(start)?.with_timezone(&Utc);
    let end_time = DateTime::parse_from_rfc3339(end)?.with_timezone(&Utc);

    let timt_vec = (0..end_time.signed_duration_since(start_time).num_hours())
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

pub async fn read_file_tx(
    files: Vec<PathBuf>,
    tx: tokio_mpmc::Sender<(String, Vec<EventTableStruct>)>,
) -> Result<()> {
    let mut tasks = JoinSet::new();

    let max_concurrent = env::var("MAX_FILE_CONCURRENT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(12);

    for path in files {
        let path_str = path.to_string_lossy().to_string();

        let file_tx = tx.clone();

        if tasks.len() >= max_concurrent {
            tasks.join_next().await;
        }
        tasks.spawn(async move {
            let event = load_gh_event(path).await;
            file_tx.send((path_str, event)).await.unwrap();
        });
    }

    while let Some(result) = tasks.join_next().await {
        result?;
    }

    Ok(())
}

async fn try_open_file(file_path: &PathBuf) -> Option<File> {
    let max_retries = env::var("MAX_FILE_RETRIES")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3);

    for i in 0..max_retries {
        if let Ok(file) = File::open(file_path).await {
            return Some(file);
        }

        tracing::info!(
            "Try {}/{}: download... {}",
            i + 1,
            max_retries,
            file_path.display()
        );
        if download_gh_archive(file_path).await.is_err() {
            continue;
        }
    }

    tracing::error!(
        "Try {} failed to open file: {}",
        max_retries,
        file_path.display()
    );
    None
}

#[tracing::instrument]
async fn load_gh_event(file_path: PathBuf) -> Vec<EventTableStruct> {
    let file = match try_open_file(&file_path).await {
        Some(file) => file.into_std().await,
        None => return vec![],
    };
    let decoder = GzDecoder::new(file);
    let reader = BufReader::with_capacity(10 * 1024 * 1024, decoder);

    let batch: Vec<EventTableStruct> = reader
        .lines()
        .filter_map(Result::ok)
        .filter_map(|line| match serde_json::from_str::<Event>(&line) {
            Ok(event) => Some(event),
            Err(e) => {
                tracing::error!("Failed to load event: {}", e);
                None
            }
        })
        .filter_map(format_event_module)
        .collect();
    batch
}

async fn download_gh_archive(file_path: &PathBuf) -> Result<()> {
    let url = format!(
        "https://data.gharchive.org/{}",
        file_path.file_name().unwrap_or_default().to_string_lossy()
    );

    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent).await?;
    }

    tracing::info!("Downloading {} to {}", url, file_path.display());

    let bytes = reqwest::get(&url).await?.bytes().await?;
    fs::write(file_path, &bytes).await?;

    let output = Command::new("gzip")
        .arg("-t")
        .arg(file_path)
        .output()
        .await?;

    if !output.status.success() {
        let _ = fs::remove_file(file_path).await;
        return Err(anyhow::anyhow!(
            "Downloaded file is corrupted, {}",
            file_path.display()
        ));
    }

    Ok(())
}

fn check_is_bot(login: &str) -> bool {
    [
        "[bot]", "-bot", "_bot", "-ci", "_ci", "-action", "_action", "-actions", "_actions",
    ]
    .iter()
    .any(|suffix| login.ends_with(suffix))
}

fn get_env_bool(key: &str) -> bool {
    env::var(key).is_ok_and(|v| v.to_lowercase() == "true")
}

fn format_event_module(event: Event) -> Option<EventTableStruct> {
    if get_env_bool("FILTER_OUT_BOT") && check_is_bot(&event.actor.login) {
        return None;
    }

    let body_raw = event
        .payload
        .as_ref()
        .and_then(|data| match &data.specific {
            Some(IssuesEvent(payload)) => payload.issue.body.as_ref(),
            Some(IssueCommentEvent(payload)) => payload.comment.body.as_ref(),
            Some(CommitCommentEvent(payload)) => payload.comment.body.as_ref(),
            Some(PullRequestEvent(payload)) => payload.pull_request.body.as_ref(),
            Some(PullRequestReviewCommentEvent(payload)) => payload.comment.body.as_ref(),
            Some(ReleaseEvent(payload)) => payload.release.body.as_ref(),
            _ => None,
        });

    let body = if !get_env_bool("FILTER_OUT_BODY") {
        body_raw.map(|b| {
            b.chars()
                .filter(|&c| !c.is_control() || c.is_whitespace())
                .collect()
        })
    } else {
        None
    };

    let payload = if !get_env_bool("FILTER_OUT_PAYLOAD") {
        serde_json::to_string(&event.payload).unwrap_or_default()
    } else {
        "{}".to_string()
    };

    Some(EventTableStruct {
        id: Decimal::from_str(&event.id)
            .unwrap_or_default()
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
        payload,
        created_at: event.created_at,
    })
}
