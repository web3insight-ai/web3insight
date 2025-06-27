CREATE OR REPLACE FUNCTION data.init_actors()
    RETURNS integer AS
$$
DECLARE
    total_imported INTEGER;
BEGIN
    TRUNCATE TABLE data.actors;

    INSERT INTO data.actors (actor_id, actor_login, created_at)
    SELECT DISTINCT ON (e.actor_id)
           e.actor_id,
           e.actor_login,
           e.created_at
    FROM data.repos r
    INNER JOIN data.events e ON r.repo_id = e.repo_id
    ORDER BY e.actor_id, e.created_at DESC;

    GET DIAGNOSTICS total_imported = ROW_COUNT;

    RETURN total_imported;
END;
$$ LANGUAGE plpgsql;

-- SELECT data.init_actors();

CREATE OR REPLACE FUNCTION data.init_repos()
    RETURNS integer AS
$$
DECLARE
    affected_rows integer;
BEGIN
    WITH latest_events AS (SELECT DISTINCT ON (repo_id) repo_id,
                                                        repo_name,
                                                        created_at
                           FROM data.events
                           ORDER BY repo_id, created_at DESC)
    UPDATE data.repos
    SET repo_name  = le.repo_name,
        created_at = le.created_at
    FROM latest_events le
    WHERE data.repos.repo_id = le.repo_id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    RETURN affected_rows;
END;
$$
    LANGUAGE plpgsql;

-- SELECT data.init_repos();