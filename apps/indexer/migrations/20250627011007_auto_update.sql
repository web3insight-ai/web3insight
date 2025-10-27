-- CREATE OR REPLACE FUNCTION data.update_repos_on_statement()
--     RETURNS TRIGGER AS
-- $$
-- BEGIN
--     INSERT INTO data.repos (repo_id, repo_name, created_at)
--     SELECT DISTINCT ON (repo_id) repo_id, repo_name, created_at
--     FROM new_events
--     ORDER BY repo_id, created_at DESC
--     ON CONFLICT (repo_id)
--         DO UPDATE SET repo_name  = EXCLUDED.repo_name,
--                       created_at = EXCLUDED.created_at
--     WHERE repos.created_at < EXCLUDED.created_at;

--     RETURN NULL;
-- END;
-- $$
--     LANGUAGE plpgsql;

-- CREATE OR REPLACE TRIGGER update_repos_after_events_insert
--     AFTER INSERT
--     ON data.events
--     REFERENCING NEW TABLE AS new_events
--     FOR EACH STATEMENT
-- EXECUTE FUNCTION data.update_repos_on_statement();





-- CREATE OR REPLACE FUNCTION data.update_actors_on_statement()
--     RETURNS TRIGGER AS
-- $$
-- BEGIN
--     INSERT INTO data.actors (actor_id, actor_login, created_at)
--     SELECT DISTINCT ON (actor_id) actor_id, actor_login, created_at
--     FROM new_events
--     ORDER BY actor_id, created_at DESC
--     ON CONFLICT (actor_id)
--         DO UPDATE SET actor_login = EXCLUDED.actor_login,
--                       created_at = EXCLUDED.created_at
--     WHERE actors.created_at < EXCLUDED.created_at;

--     RETURN NULL;
-- END;
-- $$
--     LANGUAGE plpgsql;

-- CREATE OR REPLACE TRIGGER update_actors_after_events_insert
--     AFTER INSERT
--     ON data.events
--     REFERENCING NEW TABLE AS new_events
--     FOR EACH STATEMENT
-- EXECUTE FUNCTION data.update_actors_on_statement();