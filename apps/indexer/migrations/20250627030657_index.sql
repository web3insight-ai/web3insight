CREATE INDEX IF NOT EXISTS idx_events_repo_actor_created_desc
    ON data.events (repo_id, actor_id, created_at DESC);