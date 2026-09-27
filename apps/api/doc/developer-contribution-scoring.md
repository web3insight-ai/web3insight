# Developer contribution score

This model ranks human pull request authors in tagged repositories. It returns a numeric score
and a stable rank for each requested ecosystem and for all tagged Web3 repositories.

## Attribution and contribution unit

GitHub defines an event's `actor` as the user who triggered it. A pull request event may mean
that a PR was opened or closed, but it may also mean someone assigned it or changed its labels.
The event actor is not a safe proxy for the PR author. This query uses
`payload.pull_request.user.id` as the contributor and keeps only human users (`type = 'User'`).

One contribution is one distinct `(repository, PR id, author)` tuple. Repeated lifecycle events
collapse to one row. A merged PR receives five raw points; an unmerged PR receives one. The
highest observed state wins, so an opened-then-merged PR is scored once.

Only an `opened` event establishes recent author activity. A `reopened` event refreshes activity
only when the event actor is also the PR author. A maintainer merging, assigning, or labeling a
PR does not make its author appear active. The merge state may still raise the PR's weight.

This is a PR-authorship model, not a complete measure of open-source work. Reviews, review
comments, issues, commits, and release work need separate contribution units and weights. They
should not be inferred from PR lifecycle events.

## Time and repository limits

The query uses a caller-supplied `as_of` time so results are repeatable. It considers events in
the lookback window, omits authors whose latest author-activity event is outside the active
window, and decays each PR's score by half every `half_life_days`.

Activity is evaluated per author and scope, across that scope's repositories. An active author
keeps older contributions within the lookback window; each retains its own decay timestamp.
Recent activity in Solana alone does not make an author active in Ethereum, but does qualify
that author for `web3/all`.

Raw points are capped per author and repository before scores are summed across repositories.
For a multi-ecosystem repository, the PR can contribute to each requested ecosystem. The
`web3/all` scope includes that repository exactly once.

Inputs must satisfy `lookback_days >= 1`,
`0 <= active_window_days <= lookback_days`, `half_life_days > 0`, and `repo_cap > 0`.
Invalid parameter values produce no rows. A caller should validate them before running the
query.

## Query and verification

Run `scripts/developer-contribution-score.sql` with six bind parameters. The SQL filters
`data.events` by event type and timestamp before parsing the PR payload, then joins only
repositories selected by `upstream_marks`.

Run the isolated synthetic regression fixture with:

```sh
python3 apps/api/scripts/verify-developer-contribution-score.py
```

The verifier starts a temporary local PostgreSQL cluster, loads synthetic events, runs the exact
query with fixed test parameters, checks expected rankings and scores, then stops and removes
the cluster. Raw points are compared exactly as decimals; decayed scores must be finite and
match the expected six-decimal values within `0.000001`. The latest author-activity timestamps
are compared as UTC datetimes.
It tests author attribution, merged-event deduplication, bot exclusion, inactivity, older
contributions retained across repositories, scope-specific author activity, and a repository
tagged to two ecosystems. It does not establish production performance.

For the one-hour execution requirement, run `EXPLAIN (ANALYZE, BUFFERS, SETTINGS)` against the
agreed production-like data volume. Record PostgreSQL version, event/repository row counts,
parameter values, runtime, rows removed by filters, buffer reads/hits, and the plan. The
contributor environment does not have the production dataset, so no production-scale timing is
claimed here. Base any index proposal on the actual plan and existing index inventory before
considering DDL.

GitHub event semantics are documented in [the GitHub event types reference][github-events].

[github-events]: https://docs.github.com/en/rest/using-the-rest-api/github-event-types
