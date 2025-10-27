use crate::db::{ECO_REPO, EventTableStruct, ReposTableStruct};
use crate::helper::{get_env_bool, is_missing_url};
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
    let mut start = env::var("TIME_START").unwrap_or_else(|_| "2020-01-01T00:00:00Z".to_string());
    let end = env::var("TIME_END").unwrap_or_else(|_| "2020-02-01T00:00:00Z".to_string());

    if !get_env_bool("FULL_MODE") {
        tracing::info!("Running in partial mode");
        tracing::info!("Fetching start time from DB {}", start);
        start = ReposTableStruct::get_start_time().await?.time.to_rfc3339();
        ReposTableStruct::init_repo_ids().await?;
    }

    let file_path = env::var("GHARCHIVE_FILE_PATH").unwrap_or_else(|_| "./gharchive".to_string());

    let files = load_gh_path(file_path.as_str(), start.as_str(), end.as_str())?;

    let (tx, rx) = async_channel::bounded(48);

    let max_concurrent = env::var("MAX_DB_CONCURRENT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(4);

    let mut consumers = JoinSet::new();

    for _ in 0..max_concurrent {
        let rx = rx.clone();

        consumers.spawn(async move {
            loop {
                match rx.recv().await {
                    Ok((path, events)) => {
                        EventTableStruct::batch_insert_events_pg(events, &path)
                            .await
                            .map_err(|e| {
                                tracing::error!(
                                    "Error inserting into PostgreSQL, Path: {:?}, Error: {:?}",
                                    path,
                                    e
                                );
                            })
                            .ok();
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

    ReposTableStruct::update_indexed().await?;
    ReposTableStruct::clean_events().await?;
    ReposTableStruct::init_repos().await?;
    ReposTableStruct::init_actors().await?;

    Ok(())
}

fn load_gh_path(base: &str, start: &str, end: &str) -> Result<Vec<PathBuf>> {
    let start_time = DateTime::parse_from_rfc3339(start)?.with_timezone(&Utc);
    let end_time = DateTime::parse_from_rfc3339(end)?.with_timezone(&Utc);

    let timt_vec = (0..end_time.signed_duration_since(start_time).num_hours())
        .filter_map(|h| {
            let time_format = (start_time + Duration::hours(h))
                .format("%Y/%m/%Y-%m-%d-%-H.json.gz")
                .to_string();

            let file_name = time_format.split('/').next_back().unwrap_or_default();

            if is_missing_url(file_name) {
                None
            } else {
                Some(PathBuf::from(base).join(time_format))
            }
        })
        .collect();

    Ok(timt_vec)
}

pub async fn read_file_tx(
    files: Vec<PathBuf>,
    tx: async_channel::Sender<(String, Vec<EventTableStruct>)>,
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
        .unwrap_or(5);

    for i in 0..max_retries {
        if (file_check_gzip(file_path).await).is_err() {
            tracing::info!("Check file gzip error: {}", file_path.display());
        };

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

async fn load_gh_event(file_path: PathBuf) -> Vec<EventTableStruct> {
    let file = match try_open_file(&file_path).await {
        Some(file) => file.into_std().await,
        None => return vec![],
    };
    let decoder = GzDecoder::new(file);
    let reader = BufReader::with_capacity(10 * 1024 * 1024, decoder);

    let full_mode = get_env_bool("FULL_MODE");

    let batch: Vec<EventTableStruct> = reader
        .lines()
        .map_while(Result::ok)
        .map(|line| {
            let new_line = line.chars().filter(|&c| c != '\0').collect::<String>();
            new_line.replace("\u{0000}", " ").replace("u0000", "u0020")
        })
        .filter_map(|line| {
            let deserializer = &mut serde_json::Deserializer::from_str(&line);
            match serde_path_to_error::deserialize::<_, Event>(deserializer) {
                Ok(event) => Some(event),
                Err(e) => {
                    tracing::error!("Failed at '{}': {}\nJSON: {}", e.path(), e.inner(), line);
                    None
                }
            }
        })
        .filter(|event| full_mode || ECO_REPO.contains(&event.repo.id.to_string()))
        .filter_map(format_event_module)
        .collect();
    tracing::info!("Loaded {} {} events", file_path.display(), batch.len());
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

    Ok(())
}

async fn file_check_gzip(file_path: &PathBuf) -> Result<()> {
    let verified_file_path = PathBuf::from(format!("{}.verified", file_path.display()));

    if fs::metadata(&verified_file_path).await.is_ok() {
        tracing::info!("Already validated gzip file: {}", file_path.display());
        return Ok(());
    }

    let output = Command::new("gzip")
        .arg("-t")
        .arg(file_path)
        .output()
        .await?;

    if !output.status.success() {
        fs::remove_file(file_path).await?;
        tracing::error!("Failed to validate gzip file: {}", file_path.display());
    } else {
        fs::File::create(&verified_file_path).await?;
        tracing::info!(
            "Validated gzip file and created verification marker: {}",
            file_path.display()
        );
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

fn format_event_module(event: Event) -> Option<EventTableStruct> {
    let check_bot = check_is_bot(&event.actor.login);

    if get_env_bool("FILTER_OUT_BOT") && check_bot {
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
        body: (!get_env_bool("FILTER_OUT_BODY"))
            .then(|| body_raw.cloned())
            .flatten(),
        payload: (!get_env_bool("FILTER_OUT_PAYLOAD"))
            .then(|| serde_json::to_string(&event.payload).unwrap_or_default())
            .unwrap_or_else(|| "{}".to_string()),
        abnormal: if check_bot { 1 } else { 0 },
        created_at: event.created_at,
    })
}
