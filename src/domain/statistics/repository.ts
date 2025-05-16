import { generateSuccessResponse } from "@/clients/http";

import {
  fetchEcosystemCount, fetchEcosystemRankList,
  fetchRepositoryCount, fetchRepositoryRankList,
  fetchDeveloperCount, fetchDeveloperRankList,
} from "../api/repository";

async function fetchStatisticsOverview() {
  const responses = await Promise.all([
    fetchEcosystemCount(),
    fetchRepositoryCount(),
    fetchDeveloperCount(),
    fetchDeveloperCount({ scope: "Core" }),
  ]);
  const failed = responses.find(res => !res.success);

  return failed ? failed : generateSuccessResponse({
    ecosystem: responses[0].data.total,
    repository: responses[1].data.total,
    developer: responses[2].data.total,
    coreDeveloper: responses[3].data.total,
  });
}

async function fetchStatisticsRank() {
  const responses = await Promise.all([
    fetchEcosystemRankList(),
    fetchRepositoryRankList(),
    fetchDeveloperRankList(),
  ]);
  const failed = responses.find(res => !res.success);

  return failed ? {
    ...failed,
    data: {
      ecosystem: [],
      repository: [],
      developer: [],
    },
  } : generateSuccessResponse({
    ecosystem: responses[0].data.list,
    repository: responses[1].data.list,
    developer: responses[2].data.list,
  });
}

export { fetchStatisticsOverview, fetchStatisticsRank };
