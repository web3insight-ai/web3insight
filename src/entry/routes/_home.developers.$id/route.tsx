import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getTitle } from "@/utils/app";

import RepositoryRankView from "~/repository/views/repository-rank";

import { fetchOne, fetchRepositoryRankList, fetchActivityList } from "~/developer/repository";
import ProfileCardWidget from "~/developer/widgets/profile-card";
import MetricOverviewWidget from "~/developer/widgets/metric-overview";
import ActivityListViewWidget from "~/developer/views/activity-list";

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

export const loader = async (ctx: LoaderFunctionArgs) => {
  const developerId = ctx.params.id;
  const res = await fetchOne(developerId!);
  const repositories = (res.success && (await fetchRepositoryRankList(res.data!.username)).data) || [];
  const recentActivity = (res.success && (await fetchActivityList(res.data!.username)).data) || [];

  return json({
    developer: res.data,
    repositories,
    recentActivity,
  });
};

export default function DeveloperPage() {
  const { developer, repositories, recentActivity } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 py-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <ProfileCardWidget className="mb-6" developer={developer!} />
        <MetricOverviewWidget className="mb-6" dataSource={developer!.statistics} />
        {/* <Card className="bg-white dark:bg-gray-800 shadow-sm border-none mb-6">
          <CardHeader className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contribution Activity</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            <div className="h-64 w-full">
              <MiniChart data={developer.stats.activityChartData} height={250} />
            </div>
            <div className="mt-6 grid grid-cols-7 gap-4">
              {developer.stats.contributionsByDay.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.day}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.value}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card> */}
        <RepositoryRankView
          className="mb-6"
          dataSource={repositories.map(repo => ({
            repo_id: repo.id,
            repo_name: repo.fullName,
            star_count: repo.statistics.star,
            forks_count: repo.statistics.fork,
            open_issues_count: repo.statistics.openIssue,
          }))}
        />
        <ActivityListViewWidget className="mb-6" dataSource={recentActivity} title="Activity Feed" />
      </div>
    </div>
  );
}
