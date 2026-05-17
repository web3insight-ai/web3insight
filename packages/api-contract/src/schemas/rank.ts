import { z } from 'zod';

// Reason: rank cache rows come from JSONB blobs populated by the legacy
// NestJS sync jobs. Postgres returns bigint columns (id/count fields) as
// strings, and the sync jobs serialise them straight through — so every
// numeric field can arrive as a string. Coerce at the contract level and
// mark objects `.loose()` so unspecified cached fields (e.g. extra columns
// the sync jobs include) don't trigger output validation rejects.
const int = z.coerce.number().int();
const intNonneg = z.coerce.number().int().nonnegative();
const num = z.coerce.number();

/** `QueryTopStarRepo` — repo rank entry. */
export const TopRepoSchema = z
  .object({
    repo_id: int,
    repo_name: z.string(),
    star_count: intNonneg,
    forks_count: intNonneg.default(0),
    open_issues_count: intNonneg.default(0),
    contributor_count: intNonneg,
    description: z.string().nullable(),
    star_growth_7d: num,
    developer_count_last_7_days: intNonneg,
  })
  .loose();

export const TopRepoListSchema = z.object({
  list: z.array(TopRepoSchema),
});

/** `QueryTopActorRepo` — actor's top repo entry. */
export const TopActorRepoSchema = z
  .object({
    repo_id: int,
    repo_name: z.string(),
    commit_count: intNonneg.default(0),
    score: num,
  })
  .loose();

/** `QueryTopActor` — actor rank entry. */
export const TopActorSchema = z
  .object({
    actor_id: int,
    actor_login: z.string(),
    total_score: num,
    total_commit_count: intNonneg.default(0),
    top_repos: z.array(TopActorRepoSchema),
  })
  .loose();

export const TopActorListSchema = z.object({
  list: z.array(TopActorSchema),
});

/** Ecosystem rank list entry. */
export const EcoRankSchema = z
  .object({
    eco_name: z.string(),
    actors_total: intNonneg,
    actors_new_total: intNonneg,
    actors_core_total: intNonneg,
    repos_total: intNonneg,
    kind: z.string(),
  })
  .loose();

export const EcoRankListSchema = z.object({
  list: z.array(EcoRankSchema),
});

/** Yearly developer stats. */
export const YearlyDeveloperStatSchema = z
  .object({
    activity_year: int,
    active_developers: intNonneg,
    new_developers: intNonneg,
    active_developers_yearly_growth_rate: num.nullable(),
    new_developers_yearly_growth_rate: num.nullable(),
  })
  .loose();

export const YearlyDeveloperStatListSchema = z.object({
  list: z.array(YearlyDeveloperStatSchema),
});
