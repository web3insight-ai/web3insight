import { redirect } from "next/navigation";
import { getMetadata } from "@/utils/app";
import { api } from "@/lib/api/client";
import { getUser } from "~/auth/repository";
import EcosystemRankViewWidget from "~/ecosystem/views/ecosystem-rank";
import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import RepositoryTrendingViewWidget from "~/repository/views/repository-trending";
import RepositoryDeveloperActivityViewWidget from "~/repository/views/repository-developer-activity";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";
import Section from "$/section";
import DefaultLayoutWrapper from "./DefaultLayoutWrapper";
import HomePageClient from "./HomePageClient";
import CountryDistributionChart from "$/CountryDistributionChart";

const { title, tagline, description } = getMetadata();

export const metadata = {
  title: {
    absolute: `${title} - ${tagline}`,
  },
  openGraph: {
    title: `${title} - ${tagline}`,
  },
  description,
};

interface HomePageProps {
  searchParams: Promise<{
    error?: string;
    code?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const { code } = resolvedSearchParams;

  // If this is a GitHub OAuth callback, redirect to the proper handler
  if (code) {
    redirect(`/connect/github/redirect?code=${code}`);
  }

  const user = await getUser();

  try {
    // Fetch all rank data using the api client
    const [
      ecosystemRankResult,
      repoRankResult,
      actorRankResult,
      trendingResult,
      developerActivityResult,
      countryRankResult,
    ] = await Promise.all([
      api.ecosystems.getRankList(),
      api.repos.getRankList(),
      api.actors.getRankList(),
      api.repos.getTrendingList(),
      api.repos.getDeveloperActivityList(),
      api.actors.getCountryRank(),
    ]);

    // Extract data with fallbacks
    const ecosystemRank =
      ecosystemRankResult.success && ecosystemRankResult.data
        ? ecosystemRankResult.data.list
        : [];
    const repoRank =
      repoRankResult.success && repoRankResult.data
        ? repoRankResult.data.list
        : [];
    const developerRank =
      actorRankResult.success && actorRankResult.data
        ? actorRankResult.data.list.slice(0, 10)
        : [];
    const weeklyTrendingRepos =
      trendingResult.success && trendingResult.data
        ? trendingResult.data.list
        : [];
    const weeklyDeveloperActivityRepos =
      developerActivityResult.success && developerActivityResult.data
        ? developerActivityResult.data.list
        : [];
    const countryDistribution =
      countryRankResult.success && countryRankResult.data
        ? (countryRankResult.data.list ?? [])
        : [];
    const countryDistributionTotal =
      countryRankResult.success && countryRankResult.data
        ? Number(countryRankResult.data.total ?? 0)
        : 0;

    // Log any failures for debugging
    if (!ecosystemRankResult.success) {
      console.warn("Ecosystem rank fetch failed:", ecosystemRankResult.message);
    }
    if (!repoRankResult.success) {
      console.warn("Repository rank fetch failed:", repoRankResult.message);
    }
    if (!actorRankResult.success) {
      console.warn("Actor rank fetch failed:", actorRankResult.message);
    }
    if (!trendingResult.success) {
      console.warn(
        "Weekly trending repositories fetch failed:",
        trendingResult.message,
      );
    }
    if (!developerActivityResult.success) {
      console.warn(
        "Weekly developer activity fetch failed:",
        developerActivityResult.message,
      );
    }
    if (!countryRankResult.success) {
      console.warn(
        "Country distribution fetch failed:",
        countryRankResult.message,
      );
    }

    return (
      <DefaultLayoutWrapper user={user}>
        <div className="w-full max-w-content mx-auto px-6 py-8">
          {/* Metrics Overview - Client Component */}
          <HomePageClient />

          {/* Global Contributor Map */}
          <div className="mt-12">
            <CountryDistributionChart
              data={countryDistribution}
              totalDevelopers={countryDistributionTotal}
            />
          </div>
          <Section
            className="mt-16"
            title="Web3 Ecosystem Analytics"
            summary="Comprehensive insights about major blockchain ecosystems"
          >
            <EcosystemRankViewWidget dataSource={ecosystemRank} />
          </Section>
          <Section
            className="mt-16"
            title="Weekly Star Growth"
            summary="Repositories gaining the most stars in the past 7 days"
          >
            <RepositoryTrendingViewWidget dataSource={weeklyTrendingRepos} />
          </Section>
          <Section
            className="mt-16"
            title="Developer Participation Rank"
            summary="Repositories with the most active developers over the last 7 days"
          >
            <RepositoryDeveloperActivityViewWidget
              dataSource={weeklyDeveloperActivityRepos}
            />
          </Section>
          <Section
            className="mt-16"
            title="Repository Activity"
            summary="Top repositories by developer engagement and contributions"
          >
            <RepositoryRankViewWidget dataSource={repoRank} />
          </Section>
          <Section
            className="mt-16"
            title="Top Developer Activity"
            summary="Leading contributors across Web3 ecosystems"
          >
            <DeveloperRankViewWidget dataSource={developerRank} view="grid" />
          </Section>
        </div>
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    // Extra safety net - if something else goes wrong, provide fallback data
    console.error("Loader error in home route:", error);

    return (
      <DefaultLayoutWrapper user={user}>
        <div className="w-full max-w-content mx-auto px-6 py-8">
          {/* Fallback sections with empty data */}
          <HomePageClient />

          <div className="mt-12">
            <CountryDistributionChart data={[]} totalDevelopers={0} />
          </div>
          <Section
            className="mt-16"
            title="Web3 Ecosystem Analytics"
            summary="Comprehensive insights about major blockchain ecosystems"
          >
            <EcosystemRankViewWidget dataSource={[]} />
          </Section>
          <Section
            className="mt-16"
            title="Weekly Star Growth"
            summary="Repositories gaining the most stars in the past 7 days"
          >
            <RepositoryTrendingViewWidget dataSource={[]} />
          </Section>
          <Section
            className="mt-16"
            title="Developer Participation Rank"
            summary="Repositories with the most active developers over the last 7 days"
          >
            <RepositoryDeveloperActivityViewWidget dataSource={[]} />
          </Section>
          <Section
            className="mt-16"
            title="Repository Activity"
            summary="Top repositories by developer engagement and contributions"
          >
            <RepositoryRankViewWidget dataSource={[]} />
          </Section>
          <Section
            className="mt-16"
            title="Top Developer Activity"
            summary="Leading contributors across Web3 ecosystems"
          >
            <DeveloperRankViewWidget dataSource={[]} view="grid" />
          </Section>
        </div>
      </DefaultLayoutWrapper>
    );
  }
}
