import { generateSuccessResponse } from "@/clients/http";

import { fetchEcosystemCount, fetchRepositoryCount, fetchDeveloperCount } from "../api/repository";

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

export { fetchStatisticsOverview };
