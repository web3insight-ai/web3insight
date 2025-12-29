import type { Metadata } from "next";
import EcosystemDetailClient from "./EcosystemDetailClient";
import { getTitle } from "@/utils/app";
import { api } from "@/lib/api/client";
import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import { getUser } from "~/auth/repository";

interface EcosystemPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({
  params,
}: EcosystemPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const ecosystemName = decodeURIComponent(resolvedParams.name);
  const baseTitle = `Ecosystem - ${getTitle()}`;
  const title = `${ecosystemName} ${baseTitle}`;

  return {
    title,
    openGraph: {
      title,
    },
    description: `Detailed metrics and analytics for the ${ecosystemName} ecosystem. Track developer activity, contributions, and growth.`,
  };
}

export default async function EcosystemDetailPage({
  params,
}: EcosystemPageProps) {
  const resolvedParams = await params;
  const ecosystemName = decodeURIComponent(resolvedParams.name);
  const user = await getUser();

  try {
    // Fetch all ecosystem statistics using api client
    const ecoParams = { eco: ecosystemName };
    const [
      actorTotalRes,
      actorCoreTotalRes,
      actorGrowthRes,
      actorRankRes,
      actorTrendRes,
      repoTotalRes,
      repoRankRes,
      repoTrendingRes,
      countryRankRes,
    ] = await Promise.all([
      api.actors.getTotal(ecoParams),
      api.actors.getTotal({ ...ecoParams, scope: "Core" }),
      api.actors.getGrowthCount(ecoParams),
      api.actors.getRankList(ecoParams),
      api.actors.getTrendList(ecoParams),
      api.repos.getTotal(ecoParams),
      api.repos.getRankList(ecoParams),
      api.repos.getTrendingList(ecoParams),
      api.actors.getCountryRank(ecoParams),
    ]);

    const statistics = {
      developerTotalCount:
        actorTotalRes.success && actorTotalRes.data
          ? actorTotalRes.data.total
          : 0,
      developerCoreCount:
        actorCoreTotalRes.success && actorCoreTotalRes.data
          ? actorCoreTotalRes.data.total
          : 0,
      developerGrowthCount:
        actorGrowthRes.success && actorGrowthRes.data
          ? actorGrowthRes.data.total
          : 0,
      developers:
        actorRankRes.success && actorRankRes.data ? actorRankRes.data.list : [],
      trend:
        actorTrendRes.success && actorTrendRes.data
          ? actorTrendRes.data.list
          : [],
      repositoryTotalCount:
        repoTotalRes.success && repoTotalRes.data ? repoTotalRes.data.total : 0,
      repositories:
        repoRankRes.success && repoRankRes.data ? repoRankRes.data.list : [],
      trendingRepositories:
        repoTrendingRes.success && repoTrendingRes.data
          ? repoTrendingRes.data.list
          : [],
      countryDistribution:
        countryRankRes.success && countryRankRes.data
          ? countryRankRes.data.list
          : [],
      countryDistributionTotal:
        countryRankRes.success && countryRankRes.data
          ? countryRankRes.data.total
          : 0,
    };

    const pageData = {
      ecosystem: ecosystemName,
      statistics,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EcosystemDetailClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in ecosystem detail route:", error);

    const fallbackData = {
      ecosystem: ecosystemName,
      statistics: null,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EcosystemDetailClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
