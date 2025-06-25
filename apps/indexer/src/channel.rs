use crate::db::{ECO_REPO, EventTableStruct, ReposTableStruct};
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

    if !get_env_bool("FULL_MODE") {
        tracing::info!("Running in partial mode");
        ReposTableStruct::init_repo_ids().await?;
        start = ReposTableStruct::get_start_time().await?.time.to_rfc3339();
    }

    let end = env::var("TIME_END").unwrap_or_else(|_| "2020-02-01T00:00:00Z".to_string());
    let file_path = env::var("GHARCHIVE_FILE_PATH").unwrap_or_else(|_| "./gharchive".to_string());

    let files = load_gh_path(file_path.as_str(), start.as_str(), end.as_str())?;

    let (tx, rx) = tokio_mpmc::channel(48);

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
                    Ok(Some((path, events))) => {
                        EventTableStruct::batch_insert_events_pg(events, &path)
                            .await
                            .map_err(|_| {
                                tracing::error!("Error inserting into PostgreSQL, Path: {:?}", path)
                            })
                            .ok();
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

    if !get_env_bool("FULL_MODE") {
        ReposTableStruct::update_indexed().await?;
    }

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
        .unwrap_or(5);

    for i in 0..max_retries {
        if (file_check_gzip(file_path).await).is_err() {
            tracing::info!("Check file gzip error: {}", file_path.display());
            continue;
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
        .filter_map(|line| match serde_json::from_str::<Event>(&line) {
            Ok(event) => Some(event),
            Err(e) => {
                tracing::error!("Failed to load event: {}", e);
                None
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
        created_at: event.created_at,
    })
}

fn is_missing_url(file_name: &str) -> bool {
    let missing_urls = [
        "https://data.gharchive.org/2016-10-21-18.json.gz",
        "https://data.gharchive.org/2018-10-21-23.json.gz",
        "https://data.gharchive.org/2018-10-22-0.json.gz",
        "https://data.gharchive.org/2018-10-22-1.json.gz",
        "https://data.gharchive.org/2019-05-08-12.json.gz",
        "https://data.gharchive.org/2019-05-08-13.json.gz",
        "https://data.gharchive.org/2019-05-08-12.json.gz",
        "https://data.gharchive.org/2019-05-08-13.json.gz",
        "https://data.gharchive.org/2019-09-12-8.json.gz",
        "https://data.gharchive.org/2019-09-12-9.json.gz",
        "https://data.gharchive.org/2019-09-12-10.json.gz",
        "https://data.gharchive.org/2019-09-12-11.json.gz",
        "https://data.gharchive.org/2019-09-12-12.json.gz",
        "https://data.gharchive.org/2019-09-12-13.json.gz",
        "https://data.gharchive.org/2019-09-12-14.json.gz",
        "https://data.gharchive.org/2019-09-12-15.json.gz",
        "https://data.gharchive.org/2019-09-12-16.json.gz",
        "https://data.gharchive.org/2019-09-12-17.json.gz",
        "https://data.gharchive.org/2019-09-12-18.json.gz",
        "https://data.gharchive.org/2019-09-12-19.json.gz",
        "https://data.gharchive.org/2019-09-12-20.json.gz",
        "https://data.gharchive.org/2019-09-12-21.json.gz",
        "https://data.gharchive.org/2019-09-12-22.json.gz",
        "https://data.gharchive.org/2019-09-12-23.json.gz",
        "https://data.gharchive.org/2019-09-13-0.json.gz",
        "https://data.gharchive.org/2019-09-13-1.json.gz",
        "https://data.gharchive.org/2019-09-13-2.json.gz",
        "https://data.gharchive.org/2019-09-13-3.json.gz",
        "https://data.gharchive.org/2019-09-13-4.json.gz",
        "https://data.gharchive.org/2019-09-13-5.json.gz",
        "https://data.gharchive.org/2020-03-05-22.json.gz",
        "https://data.gharchive.org/2020-06-10-12.json.gz",
        "https://data.gharchive.org/2020-06-10-13.json.gz",
        "https://data.gharchive.org/2020-06-10-14.json.gz",
        "https://data.gharchive.org/2020-06-10-15.json.gz",
        "https://data.gharchive.org/2020-06-10-16.json.gz",
        "https://data.gharchive.org/2020-06-10-17.json.gz",
        "https://data.gharchive.org/2020-06-10-18.json.gz",
        "https://data.gharchive.org/2020-06-10-19.json.gz",
        "https://data.gharchive.org/2020-06-10-20.json.gz",
        "https://data.gharchive.org/2020-06-10-21.json.gz",
        "https://data.gharchive.org/2020-08-21-9.json.gz",
        "https://data.gharchive.org/2020-08-21-10.json.gz",
        "https://data.gharchive.org/2020-08-21-11.json.gz",
        "https://data.gharchive.org/2020-08-21-12.json.gz",
        "https://data.gharchive.org/2020-08-21-13.json.gz",
        "https://data.gharchive.org/2020-08-21-14.json.gz",
        "https://data.gharchive.org/2020-08-21-15.json.gz",
        "https://data.gharchive.org/2020-08-21-16.json.gz",
        "https://data.gharchive.org/2020-08-21-17.json.gz",
        "https://data.gharchive.org/2020-08-21-18.json.gz",
        "https://data.gharchive.org/2020-08-21-19.json.gz",
        "https://data.gharchive.org/2020-08-21-20.json.gz",
        "https://data.gharchive.org/2020-08-21-21.json.gz",
        "https://data.gharchive.org/2020-08-21-22.json.gz",
        "https://data.gharchive.org/2020-08-21-23.json.gz",
        "https://data.gharchive.org/2020-08-22-0.json.gz",
        "https://data.gharchive.org/2020-08-22-1.json.gz",
        "https://data.gharchive.org/2020-08-22-2.json.gz",
        "https://data.gharchive.org/2020-08-22-3.json.gz",
        "https://data.gharchive.org/2020-08-22-4.json.gz",
        "https://data.gharchive.org/2020-08-22-5.json.gz",
        "https://data.gharchive.org/2020-08-22-6.json.gz",
        "https://data.gharchive.org/2020-08-22-7.json.gz",
        "https://data.gharchive.org/2020-08-22-8.json.gz",
        "https://data.gharchive.org/2020-08-22-9.json.gz",
        "https://data.gharchive.org/2020-08-22-10.json.gz",
        "https://data.gharchive.org/2020-08-22-11.json.gz",
        "https://data.gharchive.org/2020-08-22-12.json.gz",
        "https://data.gharchive.org/2020-08-22-13.json.gz",
        "https://data.gharchive.org/2020-08-22-14.json.gz",
        "https://data.gharchive.org/2020-08-22-15.json.gz",
        "https://data.gharchive.org/2020-08-22-16.json.gz",
        "https://data.gharchive.org/2020-08-22-17.json.gz",
        "https://data.gharchive.org/2020-08-22-18.json.gz",
        "https://data.gharchive.org/2020-08-22-19.json.gz",
        "https://data.gharchive.org/2020-08-22-20.json.gz",
        "https://data.gharchive.org/2020-08-22-21.json.gz",
        "https://data.gharchive.org/2020-08-22-22.json.gz",
        "https://data.gharchive.org/2020-08-22-23.json.gz",
        "https://data.gharchive.org/2020-08-23-0.json.gz",
        "https://data.gharchive.org/2020-08-23-1.json.gz",
        "https://data.gharchive.org/2020-08-23-2.json.gz",
        "https://data.gharchive.org/2020-08-23-3.json.gz",
        "https://data.gharchive.org/2020-08-23-4.json.gz",
        "https://data.gharchive.org/2020-08-23-5.json.gz",
        "https://data.gharchive.org/2020-08-23-6.json.gz",
        "https://data.gharchive.org/2020-08-23-7.json.gz",
        "https://data.gharchive.org/2020-08-23-8.json.gz",
        "https://data.gharchive.org/2020-08-23-9.json.gz",
        "https://data.gharchive.org/2020-08-23-10.json.gz",
        "https://data.gharchive.org/2020-08-23-11.json.gz",
        "https://data.gharchive.org/2020-08-23-12.json.gz",
        "https://data.gharchive.org/2020-08-23-13.json.gz",
        "https://data.gharchive.org/2020-08-23-14.json.gz",
        "https://data.gharchive.org/2020-08-23-15.json.gz",
        "https://data.gharchive.org/2021-08-25-17.json.gz",
        "https://data.gharchive.org/2021-08-25-18.json.gz",
        "https://data.gharchive.org/2021-08-25-19.json.gz",
        "https://data.gharchive.org/2021-08-25-20.json.gz",
        "https://data.gharchive.org/2021-08-25-21.json.gz",
        "https://data.gharchive.org/2021-08-25-22.json.gz",
        "https://data.gharchive.org/2021-08-25-23.json.gz",
        "https://data.gharchive.org/2021-08-26-0.json.gz",
        "https://data.gharchive.org/2021-08-26-1.json.gz",
        "https://data.gharchive.org/2021-08-26-2.json.gz",
        "https://data.gharchive.org/2021-08-26-3.json.gz",
        "https://data.gharchive.org/2021-08-26-4.json.gz",
        "https://data.gharchive.org/2021-08-26-5.json.gz",
        "https://data.gharchive.org/2021-08-26-6.json.gz",
        "https://data.gharchive.org/2021-08-26-7.json.gz",
        "https://data.gharchive.org/2021-08-26-8.json.gz",
        "https://data.gharchive.org/2021-08-26-9.json.gz",
        "https://data.gharchive.org/2021-08-26-10.json.gz",
        "https://data.gharchive.org/2021-08-26-11.json.gz",
        "https://data.gharchive.org/2021-08-26-12.json.gz",
        "https://data.gharchive.org/2021-08-26-13.json.gz",
        "https://data.gharchive.org/2021-08-26-14.json.gz",
        "https://data.gharchive.org/2021-08-26-15.json.gz",
        "https://data.gharchive.org/2021-08-26-16.json.gz",
        "https://data.gharchive.org/2021-08-26-17.json.gz",
        "https://data.gharchive.org/2021-08-26-18.json.gz",
        "https://data.gharchive.org/2021-08-26-19.json.gz",
        "https://data.gharchive.org/2021-08-26-20.json.gz",
        "https://data.gharchive.org/2021-08-26-21.json.gz",
        "https://data.gharchive.org/2021-08-26-22.json.gz",
        "https://data.gharchive.org/2021-08-26-23.json.gz",
        "https://data.gharchive.org/2021-08-27-0.json.gz",
        "https://data.gharchive.org/2021-08-27-1.json.gz",
        "https://data.gharchive.org/2021-08-27-2.json.gz",
        "https://data.gharchive.org/2021-08-27-3.json.gz",
        "https://data.gharchive.org/2021-08-27-4.json.gz",
        "https://data.gharchive.org/2021-08-27-5.json.gz",
        "https://data.gharchive.org/2021-08-27-6.json.gz",
        "https://data.gharchive.org/2021-08-27-7.json.gz",
        "https://data.gharchive.org/2021-08-27-8.json.gz",
        "https://data.gharchive.org/2021-08-27-9.json.gz",
        "https://data.gharchive.org/2021-08-27-10.json.gz",
        "https://data.gharchive.org/2021-08-27-11.json.gz",
        "https://data.gharchive.org/2021-08-27-12.json.gz",
        "https://data.gharchive.org/2021-08-27-13.json.gz",
        "https://data.gharchive.org/2021-08-27-14.json.gz",
        "https://data.gharchive.org/2021-08-27-15.json.gz",
        "https://data.gharchive.org/2021-08-27-16.json.gz",
        "https://data.gharchive.org/2021-08-27-17.json.gz",
        "https://data.gharchive.org/2021-08-27-18.json.gz",
        "https://data.gharchive.org/2021-08-27-19.json.gz",
        "https://data.gharchive.org/2021-08-27-20.json.gz",
        "https://data.gharchive.org/2021-08-27-21.json.gz",
        "https://data.gharchive.org/2021-08-27-22.json.gz",
        "https://data.gharchive.org/2021-10-22-5.json.gz",
        "https://data.gharchive.org/2021-10-22-6.json.gz",
        "https://data.gharchive.org/2021-10-22-7.json.gz",
        "https://data.gharchive.org/2021-10-22-8.json.gz",
        "https://data.gharchive.org/2021-10-22-9.json.gz",
        "https://data.gharchive.org/2021-10-22-10.json.gz",
        "https://data.gharchive.org/2021-10-22-11.json.gz",
        "https://data.gharchive.org/2021-10-22-12.json.gz",
        "https://data.gharchive.org/2021-10-22-13.json.gz",
        "https://data.gharchive.org/2021-10-22-14.json.gz",
        "https://data.gharchive.org/2021-10-22-15.json.gz",
        "https://data.gharchive.org/2021-10-22-16.json.gz",
        "https://data.gharchive.org/2021-10-22-17.json.gz",
        "https://data.gharchive.org/2021-10-22-18.json.gz",
        "https://data.gharchive.org/2021-10-22-19.json.gz",
        "https://data.gharchive.org/2021-10-22-20.json.gz",
        "https://data.gharchive.org/2021-10-22-21.json.gz",
        "https://data.gharchive.org/2021-10-22-22.json.gz",
        "https://data.gharchive.org/2021-10-23-2.json.gz",
        "https://data.gharchive.org/2021-10-23-3.json.gz",
        "https://data.gharchive.org/2021-10-23-4.json.gz",
        "https://data.gharchive.org/2021-10-23-5.json.gz",
        "https://data.gharchive.org/2021-10-23-6.json.gz",
        "https://data.gharchive.org/2021-10-23-7.json.gz",
        "https://data.gharchive.org/2021-10-23-8.json.gz",
        "https://data.gharchive.org/2021-10-23-9.json.gz",
        "https://data.gharchive.org/2021-10-23-10.json.gz",
        "https://data.gharchive.org/2021-10-23-11.json.gz",
        "https://data.gharchive.org/2021-10-23-12.json.gz",
        "https://data.gharchive.org/2021-10-23-13.json.gz",
        "https://data.gharchive.org/2021-10-23-14.json.gz",
        "https://data.gharchive.org/2021-10-23-15.json.gz",
        "https://data.gharchive.org/2021-10-23-16.json.gz",
        "https://data.gharchive.org/2021-10-23-17.json.gz",
        "https://data.gharchive.org/2021-10-23-18.json.gz",
        "https://data.gharchive.org/2021-10-23-19.json.gz",
        "https://data.gharchive.org/2021-10-23-20.json.gz",
        "https://data.gharchive.org/2021-10-23-21.json.gz",
        "https://data.gharchive.org/2021-10-23-22.json.gz",
        "https://data.gharchive.org/2021-10-24-3.json.gz",
        "https://data.gharchive.org/2021-10-24-4.json.gz",
        "https://data.gharchive.org/2021-10-24-5.json.gz",
        "https://data.gharchive.org/2021-10-24-6.json.gz",
        "https://data.gharchive.org/2021-10-24-7.json.gz",
        "https://data.gharchive.org/2021-10-24-8.json.gz",
        "https://data.gharchive.org/2021-10-24-9.json.gz",
        "https://data.gharchive.org/2021-10-24-10.json.gz",
        "https://data.gharchive.org/2021-10-24-11.json.gz",
        "https://data.gharchive.org/2021-10-24-12.json.gz",
        "https://data.gharchive.org/2021-10-24-13.json.gz",
        "https://data.gharchive.org/2021-10-24-14.json.gz",
        "https://data.gharchive.org/2021-10-24-15.json.gz",
        "https://data.gharchive.org/2021-10-24-16.json.gz",
        "https://data.gharchive.org/2021-10-24-17.json.gz",
        "https://data.gharchive.org/2021-10-24-18.json.gz",
        "https://data.gharchive.org/2021-10-24-19.json.gz",
        "https://data.gharchive.org/2021-10-24-20.json.gz",
        "https://data.gharchive.org/2021-10-24-21.json.gz",
        "https://data.gharchive.org/2021-10-24-22.json.gz",
        "https://data.gharchive.org/2021-10-25-1.json.gz",
        "https://data.gharchive.org/2021-10-25-2.json.gz",
        "https://data.gharchive.org/2021-10-25-3.json.gz",
        "https://data.gharchive.org/2021-10-25-4.json.gz",
        "https://data.gharchive.org/2021-10-25-5.json.gz",
        "https://data.gharchive.org/2021-10-25-6.json.gz",
        "https://data.gharchive.org/2021-10-25-7.json.gz",
        "https://data.gharchive.org/2021-10-25-8.json.gz",
        "https://data.gharchive.org/2021-10-25-9.json.gz",
        "https://data.gharchive.org/2021-10-25-10.json.gz",
        "https://data.gharchive.org/2021-10-25-11.json.gz",
        "https://data.gharchive.org/2021-10-25-12.json.gz",
        "https://data.gharchive.org/2021-10-25-13.json.gz",
        "https://data.gharchive.org/2021-10-25-14.json.gz",
        "https://data.gharchive.org/2021-10-25-15.json.gz",
        "https://data.gharchive.org/2021-10-25-16.json.gz",
        "https://data.gharchive.org/2021-10-25-17.json.gz",
        "https://data.gharchive.org/2021-10-25-18.json.gz",
        "https://data.gharchive.org/2021-10-25-19.json.gz",
        "https://data.gharchive.org/2021-10-25-20.json.gz",
        "https://data.gharchive.org/2021-10-25-21.json.gz",
        "https://data.gharchive.org/2021-10-25-22.json.gz",
        "https://data.gharchive.org/2021-10-26-0.json.gz",
        "https://data.gharchive.org/2021-10-26-1.json.gz",
        "https://data.gharchive.org/2021-10-26-2.json.gz",
        "https://data.gharchive.org/2021-10-26-3.json.gz",
        "https://data.gharchive.org/2021-10-26-4.json.gz",
        "https://data.gharchive.org/2021-10-26-5.json.gz",
        "https://data.gharchive.org/2021-10-26-6.json.gz",
        "https://data.gharchive.org/2021-10-26-7.json.gz",
        "https://data.gharchive.org/2021-10-26-8.json.gz",
        "https://data.gharchive.org/2021-10-26-9.json.gz",
        "https://data.gharchive.org/2021-10-26-10.json.gz",
        "https://data.gharchive.org/2021-10-26-11.json.gz",
        "https://data.gharchive.org/2021-10-26-12.json.gz",
        "https://data.gharchive.org/2021-10-26-13.json.gz",
        "https://data.gharchive.org/2021-10-26-14.json.gz",
        "https://data.gharchive.org/2021-10-26-15.json.gz",
        "https://data.gharchive.org/2021-10-26-16.json.gz",
        "https://data.gharchive.org/2021-10-26-17.json.gz",
        "https://data.gharchive.org/2021-10-26-18.json.gz",
        "https://data.gharchive.org/2021-10-26-19.json.gz",
        "https://data.gharchive.org/2021-10-26-20.json.gz",
        "https://data.gharchive.org/2021-10-26-21.json.gz",
        "https://data.gharchive.org/2021-10-26-22.json.gz",
        "https://data.gharchive.org/2021-10-26-23.json.gz",
        "https://data.gharchive.org/2021-10-27-0.json.gz",
        "https://data.gharchive.org/2021-10-27-1.json.gz",
        "https://data.gharchive.org/2021-10-27-2.json.gz",
        "https://data.gharchive.org/2021-10-27-3.json.gz",
        "https://data.gharchive.org/2021-10-27-4.json.gz",
        "https://data.gharchive.org/2021-10-27-5.json.gz",
        "https://data.gharchive.org/2021-10-27-6.json.gz",
        "https://data.gharchive.org/2021-10-27-7.json.gz",
        "https://data.gharchive.org/2021-10-27-8.json.gz",
        "https://data.gharchive.org/2021-10-27-9.json.gz",
        "https://data.gharchive.org/2021-10-27-10.json.gz",
        "https://data.gharchive.org/2021-10-27-11.json.gz",
        "https://data.gharchive.org/2021-10-27-12.json.gz",
        "https://data.gharchive.org/2021-10-27-13.json.gz",
        "https://data.gharchive.org/2021-10-27-14.json.gz",
        "https://data.gharchive.org/2021-10-27-15.json.gz",
        "https://data.gharchive.org/2021-10-27-16.json.gz",
        "https://data.gharchive.org/2021-10-27-17.json.gz",
        "https://data.gharchive.org/2021-10-27-18.json.gz",
        "https://data.gharchive.org/2021-10-27-19.json.gz",
        "https://data.gharchive.org/2021-10-27-20.json.gz",
        "https://data.gharchive.org/2021-10-27-21.json.gz",
        "https://data.gharchive.org/2021-10-27-22.json.gz",
        "https://data.gharchive.org/2021-10-27-23.json.gz",
        "https://data.gharchive.org/2021-10-28-0.json.gz",
        "https://data.gharchive.org/2021-10-28-1.json.gz",
        "https://data.gharchive.org/2021-10-28-2.json.gz",
        "https://data.gharchive.org/2021-10-28-3.json.gz",
        "https://data.gharchive.org/2021-10-28-4.json.gz",
        "https://data.gharchive.org/2021-10-28-5.json.gz",
        "https://data.gharchive.org/2021-10-28-6.json.gz",
        "https://data.gharchive.org/2021-10-28-7.json.gz",
        "https://data.gharchive.org/2021-10-28-8.json.gz",
        "https://data.gharchive.org/2021-10-28-9.json.gz",
        "https://data.gharchive.org/2021-10-28-10.json.gz",
        "https://data.gharchive.org/2021-10-28-11.json.gz",
        "https://data.gharchive.org/2021-10-28-12.json.gz",
        "https://data.gharchive.org/2021-10-28-13.json.gz",
        "https://data.gharchive.org/2021-10-28-14.json.gz",
        "https://data.gharchive.org/2021-10-28-15.json.gz",
        "https://data.gharchive.org/2021-10-28-16.json.gz",
        "https://data.gharchive.org/2021-10-28-17.json.gz",
        "https://data.gharchive.org/2021-10-28-18.json.gz",
        "https://data.gharchive.org/2021-10-28-19.json.gz",
        "https://data.gharchive.org/2021-10-28-20.json.gz",
        "https://data.gharchive.org/2021-10-28-21.json.gz",
        "https://data.gharchive.org/2021-10-28-22.json.gz",
        "https://data.gharchive.org/2021-10-28-23.json.gz",
        "https://data.gharchive.org/2021-10-29-0.json.gz",
        "https://data.gharchive.org/2021-10-29-1.json.gz",
        "https://data.gharchive.org/2021-10-29-2.json.gz",
        "https://data.gharchive.org/2021-10-29-3.json.gz",
        "https://data.gharchive.org/2021-10-29-4.json.gz",
        "https://data.gharchive.org/2021-10-29-5.json.gz",
        "https://data.gharchive.org/2021-10-29-6.json.gz",
        "https://data.gharchive.org/2021-10-29-7.json.gz",
        "https://data.gharchive.org/2021-10-29-8.json.gz",
        "https://data.gharchive.org/2021-10-29-9.json.gz",
        "https://data.gharchive.org/2021-10-29-10.json.gz",
        "https://data.gharchive.org/2021-10-29-11.json.gz",
        "https://data.gharchive.org/2021-10-29-12.json.gz",
        "https://data.gharchive.org/2021-10-29-13.json.gz",
        "https://data.gharchive.org/2021-10-29-14.json.gz",
        "https://data.gharchive.org/2021-10-29-15.json.gz",
        "https://data.gharchive.org/2021-10-29-16.json.gz",
        "https://data.gharchive.org/2021-10-29-17.json.gz",
    ];

    let url = format!("https://data.gharchive.org/{}", file_name);
    missing_urls.iter().any(|&missing| missing == url)
}
