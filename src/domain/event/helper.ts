import type { DataValue } from "@/types";

import { resolveDeveloperFromGithubUser } from "../developer/helper";

import type { GithubUser, EventReport } from "./typing";

function resolveEventDetail(raw: Record<string, DataValue>): EventReport {
  const ghUserMap: Record<string, GithubUser> = ((raw.github?.users || []) as GithubUser[]).reduce((acc, u) => ({
    ...acc,
    [u.id]: u,
  }), {});

  return {
    id: raw.id,
    type: raw.intent,
    description: raw.description,
    submitter: raw.submitter_id,
    contestants: ((raw.data?.users || []) as Record<string, DataValue>[]).map(u => ({
      ...resolveDeveloperFromGithubUser(ghUserMap[u.actor_id]),
      analytics: u.ecosystem_scores
        .filter((eco: Record<string, DataValue>) => eco.ecosystem !== "ALL")
        .map((eco: Record<string, DataValue>) => ({
          name: eco.ecosystem,
          score: eco.total_score,
          repos: eco.repos.map((repo: Record<string, DataValue>) => {
            const [fullName, score] = Object.entries(repo)[0];

            return { fullName, score };
          }),
        })),
    })),
  };
}

export { resolveEventDetail };
