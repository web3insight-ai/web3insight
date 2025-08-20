import type { Metadata } from "next";
import EcosystemsPageClient from "./EcosystemsPageClient";
import { fetchStatisticsRank } from "~/statistics/repository";
import { fetchEcosystemCount } from "~/api/repository";
import { getUser } from "~/auth/repository";
import { headers } from "next/headers";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "All Ecosystems | Web3 Insights",
  openGraph: {
    title: "All Ecosystems | Web3 Insights",
  },
  description:
    "Comprehensive overview of all blockchain and Web3 ecosystems with analytics and insights",
};

export default async function EcosystemsPage() {
  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/ecosystems`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
  const user = await getUser(request);

  try {
    const [rankResult, countResult] = await Promise.all([
      fetchStatisticsRank(),
      fetchEcosystemCount(),
    ]);

    const ecosystems = rankResult.success ? rankResult.data.ecosystem : [];

    if (!rankResult.success) {
      console.warn("Statistics rank fetch failed:", rankResult.message);
    }

    // Get true ecosystem count from API, fallback to array length if API fails
    const totalEcosystems = countResult.success
      ? Number(countResult.data.total)
      : ecosystems.length;

    // Calculate totals from the real data
    const totalRepositories = ecosystems.reduce(
      (acc, eco) => acc + Number(eco.repos_total),
      0
    );
    const totalDevelopers = ecosystems.reduce(
      (acc, eco) => acc + Number(eco.actors_total),
      0
    );
    const totalCoreDevelopers = ecosystems.reduce(
      (acc, eco) => acc + Number(eco.actors_core_total),
      0
    );
    const totalNewDevelopers = ecosystems.reduce(
      (acc, eco) => acc + Number(eco.actors_new_total),
      0
    );

    const pageData = {
      ecosystems,
      totalEcosystems,
      totalRepositories,
      totalDevelopers,
      totalCoreDevelopers,
      totalNewDevelopers,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EcosystemsPageClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in ecosystems route:", error);

    const fallbackData = {
      ecosystems: [],
      totalEcosystems: 0,
      totalRepositories: 0,
      totalDevelopers: 0,
      totalCoreDevelopers: 0,
      totalNewDevelopers: 0,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EcosystemsPageClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
