import { z } from 'zod';

/** `QueryTopStarRepo` — repo rank entry. */
export const TopRepoSchema = z.object({
  repo_id: z.number().int(),
  repo_name: z.string(),
  star_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative().default(0),
  open_issues_count: z.number().int().nonnegative().default(0),
  contributor_count: z.number().int().nonnegative(),
  description: z.string().nullable(),
  star_growth_7d: z.number(),
  developer_count_last_7_days: z.number().int().nonnegative(),
});

export const TopRepoListSchema = z.object({
  list: z.array(TopRepoSchema),
});

/** `QueryTopActorRepo` — actor's top repo entry. */
export const TopActorRepoSchema = z.object({
  repo_id: z.number().int(),
  repo_name: z.string(),
  commit_count: z.number().int().nonnegative().default(0),
  score: z.number(),
});

/** `QueryTopActor` — actor rank entry. */
export const TopActorSchema = z.object({
  actor_id: z.number().int(),
  actor_login: z.string(),
  total_score: z.number(),
  total_commit_count: z.number().int().nonnegative().default(0),
  top_repos: z.array(TopActorRepoSchema),
});

export const TopActorListSchema = z.object({
  list: z.array(TopActorSchema),
});

/** Ecosystem rank list entry. */
export const EcoRankSchema = z.object({
  eco_name: z.string(),
  actors_total: z.number().int().nonnegative(),
  actors_new_total: z.number().int().nonnegative(),
  actors_core_total: z.number().int().nonnegative(),
  repos_total: z.number().int().nonnegative(),
  kind: z.string(),
});

export const EcoRankListSchema = z.object({
  list: z.array(EcoRankSchema),
});

/** Yearly developer stats. */
export const YearlyDeveloperStatSchema = z.object({
  activity_year: z.number().int(),
  active_developers: z.number().int().nonnegative(),
  new_developers: z.number().int().nonnegative(),
  active_developers_yearly_growth_rate: z.number().nullable(),
  new_developers_yearly_growth_rate: z.number().nullable(),
});

export const YearlyDeveloperStatListSchema = z.object({
  list: z.array(YearlyDeveloperStatSchema),
});
