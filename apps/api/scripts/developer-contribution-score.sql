-- Reproducible PR-authorship score for an ecosystem or all tagged Web3 repos.
-- Bind parameters:
--   $1::text[]      ecosystem names, e.g. ARRAY['ethereum', 'solana']
--   $2::timestamptz score timestamp
--   $3::integer     lookback days
--   $4::integer     active-window days
--   $5::numeric     score half-life in days
--   $6::numeric     maximum raw points per author/repository
--
-- The query attributes work to pull_request.user.id. data.events.actor_id is
-- the user who triggered each event and can be an assignee, labeler, or merger.

WITH ecosystem_list AS (
  SELECT DISTINCT ecosystem_name
  FROM UNNEST(COALESCE($1::text[], ARRAY[]::text[])) AS input(ecosystem_name)
  WHERE ecosystem_name IS NOT NULL
),
params AS (
  SELECT
    $2::timestamptz AS as_of,
    $3::integer AS lookback_days,
    $4::integer AS active_window_days,
    $5::numeric AS half_life_days,
    $6::numeric AS repo_cap
),
valid_params AS (
  SELECT *
  FROM params
  WHERE lookback_days >= 1
    AND active_window_days >= 0
    AND active_window_days <= lookback_days
    AND half_life_days > 0
    AND repo_cap > 0
),
eligible_repos AS (
  SELECT DISTINCT
    'ecosystem'::text AS scope_type,
    ecosystem.ecosystem_name AS scope_name,
    repos.repo_id
  FROM data.repos repos
  CROSS JOIN ecosystem_list ecosystem
  WHERE repos.upstream_marks ? ecosystem.ecosystem_name

  UNION ALL

  SELECT
    'web3'::text AS scope_type,
    'all'::text AS scope_name,
    repos.repo_id
  FROM data.repos repos
  WHERE repos.upstream_marks IS NOT NULL
    AND repos.upstream_marks <> '{}'::jsonb
),
candidate_events AS (
  SELECT
    eligible.scope_type,
    eligible.scope_name,
    events.repo_id,
    CASE
      WHEN events.payload -> 'pull_request' -> 'user' ->> 'id' ~ '^[0-9]+$'
        THEN (events.payload -> 'pull_request' -> 'user' ->> 'id')::bigint
    END AS author_id,
    NULLIF(events.payload -> 'pull_request' ->> 'id', '') AS pull_request_id,
    events.actor_id AS event_actor_id,
    events.created_at AS event_at,
    events.payload ->> 'action' AS action,
    CASE
      WHEN events.payload -> 'pull_request' ->> 'merged' = 'true' THEN true
      ELSE false
    END AS is_merged
  FROM eligible_repos eligible
  JOIN data.events events
    ON events.repo_id = eligible.repo_id
  CROSS JOIN valid_params params
  WHERE events.event_type = 'PullRequestEvent'
    AND events.created_at >=
      params.as_of - make_interval(days => params.lookback_days)
    AND events.created_at <= params.as_of
    AND events.payload ->> 'action' IN ('opened', 'closed', 'merged', 'reopened')
    AND events.payload -> 'pull_request' -> 'user' ->> 'type' = 'User'
    AND events.payload -> 'pull_request' -> 'user' ->> 'id' ~ '^[0-9]+$'
    AND NULLIF(events.payload -> 'pull_request' ->> 'id', '') IS NOT NULL
),
pr_contributions AS (
  SELECT
    scope_type,
    scope_name,
    author_id,
    repo_id,
    pull_request_id,
    MAX(CASE WHEN is_merged THEN 5::numeric ELSE 1::numeric END) AS raw_points,
    MAX(event_at) FILTER (
      WHERE action = 'opened'
        OR (action = 'reopened' AND event_actor_id = author_id)
    ) AS last_contribution_at
  FROM candidate_events
  WHERE author_id IS NOT NULL
  GROUP BY scope_type, scope_name, author_id, repo_id, pull_request_id
),
scoped_contributions AS (
  SELECT
    contributions.*,
    MAX(last_contribution_at) OVER (
      PARTITION BY scope_type, scope_name, author_id
    ) AS last_author_activity_at
  FROM pr_contributions contributions
),
active_prs AS (
  SELECT
    contributions.scope_type,
    contributions.scope_name,
    contributions.author_id,
    contributions.repo_id,
    contributions.raw_points,
    contributions.last_contribution_at,
    contributions.raw_points * POWER(
      0.5::double precision,
      EXTRACT(EPOCH FROM (params.as_of - contributions.last_contribution_at))
        / 86400.0
        / params.half_life_days::double precision
    ) AS decayed_points
  FROM scoped_contributions contributions
  CROSS JOIN valid_params params
  WHERE contributions.last_contribution_at IS NOT NULL
    -- An active author retains older lookback contributions from other repos
    -- in this scope. Each PR still decays from its own contribution timestamp.
    AND contributions.last_author_activity_at >=
      params.as_of - make_interval(days => params.active_window_days)
),
repo_scores AS (
  SELECT
    active.scope_type,
    active.scope_name,
    active.author_id,
    active.repo_id,
    LEAST(SUM(active.raw_points), params.repo_cap) AS raw_points,
    SUM(active.decayed_points) * LEAST(
      1.0::double precision,
      params.repo_cap::double precision
        / NULLIF(SUM(active.raw_points)::double precision, 0.0)
    ) AS contribution_score,
    MAX(active.last_contribution_at) AS last_contribution_at
  FROM active_prs active
  CROSS JOIN valid_params params
  GROUP BY
    active.scope_type,
    active.scope_name,
    active.author_id,
    active.repo_id,
    params.repo_cap
),
actor_scores AS (
  SELECT
    repos.scope_type,
    repos.scope_name,
    actors.actor_id,
    actors.actor_login,
    SUM(repos.raw_points) AS raw_points,
    SUM(repos.contribution_score) AS contribution_score,
    MAX(repos.last_contribution_at) AS last_contribution_at
  FROM repo_scores repos
  JOIN data.actors actors
    ON actors.actor_id = repos.author_id
  WHERE actors.actor_login IS NOT NULL
    AND actors.actor_login NOT ILIKE '%[bot]%'
    AND actors.actor_login NOT ILIKE 'bot-%'
    AND actors.actor_login NOT ILIKE '%-bot'
    AND actors.actor_login NOT ILIKE 'Copilot'
  GROUP BY repos.scope_type, repos.scope_name, actors.actor_id, actors.actor_login
),
ranked AS (
  SELECT
    actors.scope_type,
    actors.scope_name,
    actors.actor_id,
    actors.actor_login,
    actors.raw_points,
    actors.contribution_score,
    actors.last_contribution_at,
    ROW_NUMBER() OVER (
      PARTITION BY actors.scope_type, actors.scope_name
      ORDER BY
        actors.contribution_score DESC,
        actors.raw_points DESC,
        actors.actor_id ASC
    ) AS rank
  FROM actor_scores actors
)
SELECT
  scope_type,
  scope_name,
  rank,
  actor_id,
  actor_login,
  raw_points,
  ROUND(contribution_score::numeric, 6) AS contribution_score,
  last_contribution_at
FROM ranked
ORDER BY scope_type, scope_name, rank;
