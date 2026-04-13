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
import { SectionHeader, SmallCapsLabel } from "$/primitives";
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

  if (code) {
    redirect(`/connect/github/redirect?code=${code}`);
  }

  const user = await getUser();

  const results = await Promise.allSettled([
    api.ecosystems.getRankList(),
    api.repos.getRankList(),
    api.actors.getRankList(),
    api.repos.getTrendingList(),
    api.repos.getDeveloperActivityList(),
    api.actors.getCountryRank(),
  ]);

  const [
    ecosystemRankResult,
    repoRankResult,
    actorRankResult,
    trendingResult,
    developerActivityResult,
    countryRankResult,
  ] = results.map((r) => (r.status === "fulfilled" ? r.value : null));

  const ecosystemRank =
    ecosystemRankResult?.success && ecosystemRankResult.data
      ? ecosystemRankResult.data.list
      : [];
  const repoRank =
    repoRankResult?.success && repoRankResult.data
      ? repoRankResult.data.list
      : [];
  const developerRank =
    actorRankResult?.success && actorRankResult.data
      ? actorRankResult.data.list.slice(0, 10)
      : [];
  const weeklyTrendingRepos =
    trendingResult?.success && trendingResult.data
      ? trendingResult.data.list
      : [];
  const weeklyDeveloperActivityRepos =
    developerActivityResult?.success && developerActivityResult.data
      ? developerActivityResult.data.list
      : [];
  const countryDistribution =
    countryRankResult?.success && countryRankResult.data
      ? (countryRankResult.data.list ?? [])
      : [];
  const countryDistributionTotal =
    countryRankResult?.success && countryRankResult.data
      ? Number(countryRankResult.data.total ?? 0)
      : 0;

  return (
    <DefaultLayoutWrapper user={user}>
      <div className="w-full max-w-content mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col gap-4 pb-12 border-b border-rule mb-12">
          <SmallCapsLabel tone="accent">
            On-chain developer activity · live
          </SmallCapsLabel>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-fg max-w-[18ch]">
            The developer layer,
            <br />
            measured in public.
          </h1>
          <p className="text-[1rem] leading-[1.55] text-fg-muted max-w-[var(--measure)] mt-1">
            Contribution, attention, and retention signals across every major
            Web3 ecosystem. Build grant memos from real commits; read
            leaderboards without squinting. Methodology stays visible.
          </p>
        </div>

        <HomePageClient />

        <div className="mt-16">
          <CountryDistributionChart
            data={countryDistribution}
            totalDevelopers={countryDistributionTotal}
          />
        </div>

        <Section
          className="mt-20"
          title="Ecosystem analytics"
          summary="The major Web3 ecosystems ranked by contributor density and repository volume."
        >
          <EcosystemRankViewWidget dataSource={ecosystemRank} />
        </Section>

        <Section
          className="mt-20"
          title="Weekly star growth"
          summary="Repositories gaining the most stars over the last 7 days — the attention leaderboard."
        >
          <RepositoryTrendingViewWidget dataSource={weeklyTrendingRepos} />
        </Section>

        <Section
          className="mt-20"
          title="Developer participation"
          summary="Repositories with the most distinct active authors this week. The scale of collaboration, not just the size of the repo."
        >
          <RepositoryDeveloperActivityViewWidget
            dataSource={weeklyDeveloperActivityRepos}
          />
        </Section>

        <Section
          className="mt-20"
          title="Repository activity"
          summary="Top repositories by sustained developer engagement and contribution volume."
        >
          <RepositoryRankViewWidget dataSource={repoRank} />
        </Section>

        <div className="mt-20">
          <SectionHeader
            kicker="Contributors"
            title="Top developer activity"
            deck="The contributors carrying the most weight across tracked Web3 ecosystems, scored by sustained PR and commit signal."
          />
          <DeveloperRankViewWidget dataSource={developerRank} view="grid" />
        </div>
      </div>
    </DefaultLayoutWrapper>
  );
}
