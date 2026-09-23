CREATE SCHEMA data;

CREATE TABLE data.actors (
  actor_id bigint NOT NULL,
  actor_login text
);

CREATE TABLE data.repos (
  repo_id bigint NOT NULL,
  upstream_marks jsonb
);

CREATE TABLE data.events (
  id bigint NOT NULL,
  actor_id bigint NOT NULL,
  repo_id bigint NOT NULL,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);

INSERT INTO data.actors (actor_id, actor_login) VALUES
  (10, 'alice'),
  (20, 'bob'),
  (25, 'carol'),
  (30, 'maintainer'),
  (40, 'stale-author'),
  (50, 'automation[bot]');

INSERT INTO data.repos (repo_id, upstream_marks) VALUES
  (100, '{"ethereum": true, "solana": true}'::jsonb),
  (200, '{"ethereum": true}'::jsonb),
  (300, '{}'::jsonb);

INSERT INTO data.events (id, actor_id, repo_id, event_type, created_at, payload) VALUES
  (
    1, 10, 100, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'opened', 'pull_request', jsonb_build_object(
      'id', 1001, 'merged', false,
      'user', jsonb_build_object('id', 10, 'login', 'alice', 'type', 'User')
    ))
  ),
  (
    2, 20, 100, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'labeled', 'pull_request', jsonb_build_object(
      'id', 1001, 'merged', false,
      'user', jsonb_build_object('id', 10, 'login', 'alice', 'type', 'User')
    ))
  ),
  (
    3, 30, 100, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'closed', 'pull_request', jsonb_build_object(
      'id', 1001, 'merged', true,
      'user', jsonb_build_object('id', 10, 'login', 'alice', 'type', 'User')
    ))
  ),
  (
    4, 10, 200, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'opened', 'pull_request', jsonb_build_object(
      'id', 1002, 'merged', false,
      'user', jsonb_build_object('id', 10, 'login', 'alice', 'type', 'User')
    ))
  ),
  (
    5, 20, 200, 'PullRequestEvent', '2026-03-01 00:00:00+00',
    jsonb_build_object('action', 'opened', 'pull_request', jsonb_build_object(
      'id', 1003, 'merged', false,
      'user', jsonb_build_object('id', 20, 'login', 'bob', 'type', 'User')
    ))
  ),
  (
    6, 40, 200, 'PullRequestEvent', '2026-03-01 00:00:00+00',
    jsonb_build_object('action', 'opened', 'pull_request', jsonb_build_object(
      'id', 1004, 'merged', false,
      'user', jsonb_build_object('id', 40, 'login', 'stale-author', 'type', 'User')
    ))
  ),
  (
    7, 20, 200, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'reopened', 'pull_request', jsonb_build_object(
      'id', 1004, 'merged', false,
      'user', jsonb_build_object('id', 40, 'login', 'stale-author', 'type', 'User')
    ))
  ),
  (
    8, 50, 100, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'opened', 'pull_request', jsonb_build_object(
      'id', 1005, 'merged', false,
      'user', jsonb_build_object('id', 50, 'login', 'automation[bot]', 'type', 'Bot')
    ))
  ),
  (
    9, 25, 200, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'opened', 'pull_request', jsonb_build_object(
      'id', 1006, 'merged', false,
      'user', jsonb_build_object('id', 25, 'login', 'carol', 'type', 'User')
    ))
  ),
  (
    10, 20, 200, 'PullRequestEvent', '2026-09-24 00:00:00+00',
    jsonb_build_object('action', 'reopened', 'pull_request', jsonb_build_object(
      'id', 1003, 'merged', false,
      'user', jsonb_build_object('id', 20, 'login', 'bob', 'type', 'User')
    ))
  );
