mod channel;
mod db;

use crate::{channel::start_channel, db::init_pg};
use anyhow::Result;
use dotenvy::dotenv;
use std::time::Instant;
use tracing::level_filters::LevelFilter;
use tracing_subscriber::{
    Layer,
    fmt::{self, format::FmtSpan},
    layer::SubscriberExt,
    util::SubscriberInitExt,
};

#[tokio::main]
async fn main() -> Result<()> {
    let _ = dotenv();

    let start = Instant::now();

    let console = fmt::Layer::new()
        .with_span_events(FmtSpan::CLOSE)
        .pretty()
        .with_ansi(false)
        .with_filter(LevelFilter::INFO);

    tracing_subscriber::registry().with(console).init();

    init_pg().await?;

    start_channel().await?;

    let duration = start.elapsed();

    tracing::info!("Total time elapsed: {:?}", duration);

    Ok(())
}
