import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getTitle } from "@/utils/app";
import ChartCard from "@/components/control/chart-card";

import type { Repository } from "~/repository/typing";
import RepositoryRankView from "~/repository/views/repository-rank";

import type { DeveloperActivity, DeveloperContribution } from "~/developer/typing";
import { fetchOne, fetchRepositoryRankList, fetchActivityList, fetchContributionList } from "~/developer/repository";
import ProfileCardWidget from "~/developer/widgets/profile-card";
import MetricOverviewWidget from "~/developer/widgets/metric-overview";
import ActivityListViewWidget from "~/developer/views/activity-list";

import ClientOnly from "../../components/ClientOnly";

import { resolveChartOptions } from "./helper";

export const loader = async (ctx: LoaderFunctionArgs) => {
  const developerId = ctx.params.id;

  const res = await fetchOne(developerId!);

  let contributions: DeveloperContribution[] = [];
  let repositories: Repository[] = [];
  let recentActivity: DeveloperActivity[] = [];

  if (res.success) {
    try {
      const responses = await Promise.all([
        fetchContributionList(res.data!.id),
        fetchRepositoryRankList(res.data!.username),
        fetchActivityList(res.data!.username),
      ]);

      contributions = responses[0].data;
      repositories = responses[1].data;
      recentActivity = responses[2].data;
    } catch (error) {
      console.error(`[Route] Error during API calls:`, error);
      // Continue with empty data rather than throwing
    }
  } else if (res.code === "404") {
    throw new Response(`Developer \`${developerId}\` doesn't exist.`, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json({
    developer: res.data,
    contributions,
    repositories,
    recentActivity,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const baseTitle = `Developer Profile - ${getTitle()}`;
  const developerHandle = `@${data?.developer?.username}`;
  const title = data ? `${developerHandle} ${baseTitle}` : baseTitle;

  return [
    { title },
    { property: "og:title", content: title },
    {
      name: "description",
      content: data
        ? `Developer profile and contribution analytics for ${developerHandle}. Track ecosystem contributions and activity.`
        : "Web3 developer profile and analytics",
    },
  ];
};

export default function DeveloperPage() {
  const { developer, contributions, repositories, recentActivity } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
      <div className="w-full max-w-content mx-auto px-6">
        <div className="animate-fade-in">
          <ProfileCardWidget className="mb-8" developer={developer!} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <MetricOverviewWidget className="mb-8" dataSource={developer!.statistics} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <ClientOnly>
            <ChartCard
              className="mb-8"
              title="Contribution Activity"
              style={{ height: "280px" }}
              option={resolveChartOptions(contributions)}
            />
          </ClientOnly>
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <RepositoryRankView
            className="mb-8"
            dataSource={repositories.map(repo => ({
              repo_id: repo.id,
              repo_name: repo.fullName,
              star_count: repo.statistics.star,
              forks_count: repo.statistics.fork,
              open_issues_count: repo.statistics.openIssue,
              contributor_count: repo.statistics.contributor || 0,
            }))}
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <ActivityListViewWidget dataSource={recentActivity} title="Activity Feed" />
        </div>
      </div>
    </div>
  );
}
