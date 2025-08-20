import httpClient from "./client";

async function fetchData(
  type: "openrank" | "attention" | "community_openrank" | "participants" | "new_contributors" | "inactive_contributors",
  target: string,
) {
  return httpClient.get(`/github/${target}/${type}.json`);
}

const fetchRepoOpenrank = fetchData.bind(null, "openrank");
const fetchRepoAttention = fetchData.bind(null, "attention");
const fetchRepoParticipants = fetchData.bind(null, "participants");
const fetchRepoNewContributors = fetchData.bind(null, "new_contributors");
const fetchRepoInactiveContributors = fetchData.bind(null, "inactive_contributors");

async function fetchRepoCommunityOpenrank(repo: string) {
  const res = await fetchData("community_openrank", repo);

  // Sort the months in descending order
  const sortedMonths = Object.keys(res.data).sort((a, b) =>
    b.localeCompare(a),
  );

  // Get the most recent 6 months
  const recentMonths = sortedMonths.slice(0, 6);

  // Create a new object with only the recent months' data
  const recentData: Record<string, Record<string, number>> = {};
  recentMonths.forEach((month) => {
    recentData[month] = res.data[month];
  });

  // Return the modified data object
  return {
    ...res,
    data: recentData,
  };
}

export {
  fetchRepoOpenrank, fetchRepoCommunityOpenrank,
  fetchRepoAttention,
  fetchRepoParticipants, fetchRepoNewContributors, fetchRepoInactiveContributors,
};
