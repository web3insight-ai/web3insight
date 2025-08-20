import type { Metadata } from "next";
import RepositoriesPageClient from "./RepositoriesPageClient";
import {
  fetchStatisticsRank,
  fetchStatisticsOverview,
} from "~/statistics/repository";
import { getUser } from "~/auth/repository";
import { headers } from "next/headers";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "All Repositories | Web3 Insights",
  openGraph: {
    title: "All Repositories | Web3 Insights",
  },
  description:
    "Top repositories by developer engagement and contributions across Web3 ecosystems",
};

export default async function RepositoriesPage() {
  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/repositories`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
  const user = await getUser(request);

  try {
    const [statisticsResult, rankResult] = await Promise.all([
      fetchStatisticsOverview(),
      fetchStatisticsRank(),
    ]);

    const repositories = rankResult.success ? rankResult.data.repository : [];
    const statisticOverview = statisticsResult.success
      ? statisticsResult.data
      : {
          ecosystem: 0,
          repository: 0,
          developer: 0,
          coreDeveloper: 0,
        };

    if (!statisticsResult.success) {
      console.warn(
        "Statistics overview fetch failed:",
        statisticsResult.message
      );
    }
    if (!rankResult.success) {
      console.warn("Statistics rank fetch failed:", rankResult.message);
    }

    const pageData = {
      repositories,
      totalRepositories: Number(statisticOverview.repository),
      totalDevelopers: Number(statisticOverview.developer),
      totalCoreDevelopers: Number(statisticOverview.coreDeveloper),
      totalEcosystems: Number(statisticOverview.ecosystem),
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <RepositoriesPageClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in repositories route:", error);

    const fallbackData = {
      repositories: [],
      totalRepositories: 0,
      totalDevelopers: 0,
      totalCoreDevelopers: 0,
      totalEcosystems: 0,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <RepositoriesPageClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
