mod channel;
mod db;

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
use crate::channel::start_channel;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv()?;

    let start = Instant::now();

    let console = fmt::Layer::new()
        .with_span_events(FmtSpan::CLOSE)
        .pretty()
        .with_ansi(false)
        .with_filter(LevelFilter::INFO);

    tracing_subscriber::registry().with(console).init();

    start_channel().await?;

    let duration = start.elapsed();

    tracing::info!("Total time elapsed: {:?}", duration);

    Ok(())
}
