import { redirect } from 'next/navigation';
import { getMetadata } from "@/utils/app";
import { fetchStatisticsOverview, fetchStatisticsRank } from "~/statistics/repository";
import { fetchWeeklyTrendingList } from "~/repository/repository";
import { getUser } from "~/auth/repository";
import { headers } from 'next/headers';
import EcosystemRankViewWidget from "~/ecosystem/views/ecosystem-rank";
import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import RepositoryTrendingViewWidget from "~/repository/views/repository-trending";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";
import Section from "$/section";
import DefaultLayoutWrapper from "./DefaultLayoutWrapper";
import HomePageClient from "./HomePageClient";

const { title, tagline, description } = getMetadata();

export const metadata = {
  title: `${title} - ${tagline}`,
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

  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}`;
  
  const request = new Request(url, {
    headers: headersList,
  });
  const user = await getUser(request);

  try {
    const [statisticsResult, rankResult, trendingResult] = await Promise.all([
      fetchStatisticsOverview(),
      fetchStatisticsRank(),
      fetchWeeklyTrendingList(),
    ]);

    // Use fallback data if statistics fetch failed
    // Client component will handle data fetching via API
    // const statisticOverview = statisticsResult.success ? statisticsResult.data : {
    //   ecosystem: 0,
    //   repository: 0,
    //   developer: 0,
    //   coreDeveloper: 0,
    // };

    // Use fallback data if rank fetch failed
    const statisticRank = rankResult.success ? rankResult.data : {
      ecosystem: [],
      repository: [],
      developer: [],
    };
    const weeklyTrendingRepos = trendingResult.success ? trendingResult.data : [];

    // Log any failures for debugging
    if (!statisticsResult.success) {
      console.warn("Statistics overview fetch failed:", statisticsResult.message);
    }
    if (!rankResult.success) {
      console.warn("Statistics rank fetch failed:", rankResult.message);
    }
    if (!trendingResult.success) {
      console.warn("Weekly trending repositories fetch failed:", trendingResult.message);
    }

    return (
      <DefaultLayoutWrapper user={user}>
        <div className="w-full max-w-content mx-auto px-6 py-8">
          {/* AI Query Section - Client Component */}
          <HomePageClient />

          {/* Server-rendered content sections */}
          <Section
            className="mt-12"
            title="Web3 Ecosystem Analytics"
            summary="Comprehensive insights about major blockchain ecosystems"
          >
            <EcosystemRankViewWidget dataSource={statisticRank.ecosystem} />
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
            title="Repository Activity"
            summary="Top repositories by developer engagement and contributions"
          >
            <RepositoryRankViewWidget dataSource={statisticRank.repository} />
          </Section>
          <Section
            className="mt-16"
            title="Top Developer Activity"
            summary="Leading contributors across Web3 ecosystems"
          >
            <DeveloperRankViewWidget dataSource={statisticRank.developer} view="grid" />
          </Section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border dark:border-border-dark">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Supported by{" "}
                <a href="https://openbuild.xyz/" className="text-foreground dark:text-foreground font-medium hover:text-primary transition-colors">
                  OpenBuild
                </a>{" "}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600">© {new Date().getFullYear()} {title}. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    // Extra safety net - if something else goes wrong, provide fallback data
    console.error("Loader error in home route:", error);

    // Client component will handle fallback data
    // const fallbackStatisticOverview = {
    //   ecosystem: 0,
    //   repository: 0,
    //   developer: 0,
    //   coreDeveloper: 0,
    // };

    const fallbackStatisticRank = {
      ecosystem: [],
      repository: [],
      developer: [],
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <div className="w-full max-w-content mx-auto px-6 py-8">
          <HomePageClient />

          {/* Fallback sections */}
          <Section
            className="mt-12"
            title="Web3 Ecosystem Analytics"
            summary="Comprehensive insights about major blockchain ecosystems"
          >
            <EcosystemRankViewWidget dataSource={fallbackStatisticRank.ecosystem} />
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
            title="Repository Activity"
            summary="Top repositories by developer engagement and contributions"
          >
            <RepositoryRankViewWidget dataSource={fallbackStatisticRank.repository} />
          </Section>
          <Section
            className="mt-16"
            title="Top Developer Activity"
            summary="Leading contributors across Web3 ecosystems"
          >
            <DeveloperRankViewWidget dataSource={fallbackStatisticRank.developer} view="grid" />
          </Section>
        </div>
      </DefaultLayoutWrapper>
    );
  }
}
