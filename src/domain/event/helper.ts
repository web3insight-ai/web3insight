import type { DataValue } from "@/types";

import { resolveDeveloperFromGithubUser } from "../developer/helper";

import type { GithubUser, EventReport } from "./typing";

function resolveEventDetail(raw: Record<string, DataValue>): EventReport {
  const ghUserMap: Record<string, GithubUser> = ((raw.github?.users || []) as GithubUser[]).reduce((acc, u) => ({
    ...acc,
    [u.id]: u,
  }), {});

  const contestants = ((raw.data?.users || []) as Record<string, DataValue>[]).map(u => {
    const analytics = u.ecosystem_scores
      .filter((eco: Record<string, DataValue>) => eco.ecosystem !== "ALL")
      .map((eco: Record<string, DataValue>) => {
        const repos = eco.repos.map((repo: Record<string, DataValue>) => {
          const entries = Object.entries(repo);
          if (entries.length === 0) {
            return { fullName: "unknown", score: "0" };
          }

          const [fullName, score] = entries[0];
          return { fullName, score };
        });

        return {
          name: eco.ecosystem,
          score: eco.total_score,
          repos,
        };
      });

    return {
      ...resolveDeveloperFromGithubUser(ghUserMap[u.actor_id]),
      analytics,
    };
  });

  const result = {
    id: raw.id,
    type: raw.intent,
    description: raw.description,
    submitter: raw.submitter_id,
    contestants,
  };

  return result;
}

export { resolveEventDetail };
