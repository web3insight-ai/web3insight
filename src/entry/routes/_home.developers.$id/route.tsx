import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardBody, CardHeader, Divider, Progress } from "@nextui-org/react";
import { Users, Code2, Zap, ArrowUpRight, ArrowDownRight, GitBranch, GitCommit, GitPullRequest, Eye } from "lucide-react";

import { getTitle } from "@/utils/app";

import RepositoryRankView from "~/repository/views/repository-rank";

import { fetchOne, fetchRepositoryRankList } from "~/developer/repository";
import ProfileCardWidget from "~/developer/widgets/profile-card";
import MetricOverviewWidget from "~/developer/widgets/metric-overview";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const baseTitle = `Developer Profile - ${getTitle()}`;
  const title = data ? `${data.developer.handle} ${baseTitle}` : baseTitle;

  return [
    { title },
    { property: "og:title", content: title },
    {
      name: "description",
      content: data
        ? `Developer profile and contribution analytics for ${data.developer.handle}. Track ecosystem contributions and activity.`
        : "Web3 developer profile and analytics",
    },
  ];
};

// Generate mock chart data for visualization
const generateChartData = (points: number, isPositive: boolean = true, volatility: number = 5) => {
  const data = [];
  let value = Math.random() * 50 + 50;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - (isPositive ? 0.4 : 0.6)) * volatility;
    value = Math.max(0, value + change);
    data.push(value);
  }

  return data;
};

export const loader = async (ctx: LoaderFunctionArgs) => {
  const developerId = ctx.params.id;

  // In a real application, you would fetch actual developer data
  // For this example, we're creating mock data based on the developer ID

  // Generate a consistent name based on the developer ID
  const res = await fetchOne(developerId!);
  const devIdNumber = parseInt(developerId?.replace(/\D/g, '1') || '1');
  const nameOptions = ["alex", "sam", "taylor", "jordan", "casey", "morgan", "riley", "jamie", "jesse", "avery"];
  const developerName = nameOptions[devIdNumber % nameOptions.length];
  const handle = `@${developerName}_${devIdNumber}`;

  const repositories = (res.success && (await fetchRepositoryRankList(res.data!.username)).data) || [];

  // Mock developer data
  const developer = {
    id: developerId,
    name: `${developerName}.eth`,
    handle,
    avatarUrl: `https://i.pravatar.cc/150?u=${developerId}`,
    joinedDate: new Date(Date.now() - (Math.random() * 31536000000 * 3)).toLocaleDateString(), // Random date within last 3 years
    bio: "Web3 developer passionate about decentralized systems and blockchain technology. Contributing to various open-source projects.",
    location: ["San Francisco", "Berlin", "Singapore", "Toronto", "London"][devIdNumber % 5],
    website: `https://${developerName}.xyz`,
    twitterHandle: `@${developerName}_web3`,
    githubHandle: `${developerName}-dev`,
    stats: {
      totalContributions: Math.floor(Math.random() * 50000) + 10000,
      repositories: Math.floor(Math.random() * 100) + 20,
      commits: Math.floor(Math.random() * 5000) + 1000,
      pullRequests: Math.floor(Math.random() * 2000) + 500,
      codeReviews: Math.floor(Math.random() * 1000) + 200,
      issuesReported: Math.floor(Math.random() * 500) + 100,
      growth: Math.random() > 0.2 ? `+${(Math.random() * 20).toFixed(1)}%` : `-${(Math.random() * 8).toFixed(1)}%`,
      isPositive: Math.random() > 0.2,
      activityChartData: generateChartData(52, Math.random() > 0.2, 10), // Weekly data for a year
      contributionsByDay: [
        { day: "Mon", value: Math.floor(Math.random() * 100) + 20 },
        { day: "Tue", value: Math.floor(Math.random() * 100) + 20 },
        { day: "Wed", value: Math.floor(Math.random() * 100) + 20 },
        { day: "Thu", value: Math.floor(Math.random() * 100) + 20 },
        { day: "Fri", value: Math.floor(Math.random() * 100) + 20 },
        { day: "Sat", value: Math.floor(Math.random() * 60) + 10 },
        { day: "Sun", value: Math.floor(Math.random() * 40) + 5 },
      ],
    },
  };

  // Ecosystems contributed to
  const ecosystems = [
    {
      name: "Ethereum",
      contributions: Math.floor(Math.random() * 20000) + 5000,
      percentage: Math.floor(Math.random() * 30) + 30,
      color: "primary",
      growth: `+${(Math.random() * 15).toFixed(1)}%`,
      isPositive: true,
      chartData: generateChartData(20, true, 5),
    },
    {
      name: "Solana",
      contributions: Math.floor(Math.random() * 15000) + 3000,
      percentage: Math.floor(Math.random() * 20) + 20,
      color: "secondary",
      growth: `+${(Math.random() * 12).toFixed(1)}%`,
      isPositive: true,
      chartData: generateChartData(20, true, 4),
    },
    {
      name: "Polkadot",
      contributions: Math.floor(Math.random() * 10000) + 2000,
      percentage: Math.floor(Math.random() * 15) + 10,
      color: "success",
      growth: Math.random() > 0.7 ? `-${(Math.random() * 5).toFixed(1)}%` : `+${(Math.random() * 10).toFixed(1)}%`,
      isPositive: Math.random() > 0.7 ? false : true,
      chartData: generateChartData(20, Math.random() > 0.7 ? false : true, 6),
    },
    {
      name: "Near",
      contributions: Math.floor(Math.random() * 7000) + 1000,
      percentage: Math.floor(Math.random() * 10) + 5,
      color: "warning",
      growth: Math.random() > 0.6 ? `-${(Math.random() * 8).toFixed(1)}%` : `+${(Math.random() * 7).toFixed(1)}%`,
      isPositive: Math.random() > 0.6 ? false : true,
      chartData: generateChartData(20, Math.random() > 0.6 ? false : true, 5),
    },
    {
      name: "Cosmos",
      contributions: Math.floor(Math.random() * 5000) + 500,
      percentage: Math.floor(Math.random() * 8) + 3,
      color: "danger",
      growth: Math.random() > 0.5 ? `-${(Math.random() * 10).toFixed(1)}%` : `+${(Math.random() * 5).toFixed(1)}%`,
      isPositive: Math.random() > 0.5 ? false : true,
      chartData: generateChartData(20, Math.random() > 0.5 ? false : true, 4),
    },
  ];

  // Projects contributed to
  const projects = [
    {
      name: "ethereum/go-ethereum",
      contributions: Math.floor(Math.random() * 5000) + 1000,
      stars: Math.floor(Math.random() * 40000) + 10000,
      forks: Math.floor(Math.random() * 15000) + 5000,
      commits: Math.floor(Math.random() * 100) + 30,
      pullRequests: Math.floor(Math.random() * 50) + 10,
      issues: Math.floor(Math.random() * 40) + 5,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toLocaleDateString(), // Random date within last 30 days
      chartData: generateChartData(20, true, 5),
    },
    {
      name: "solana-labs/solana",
      contributions: Math.floor(Math.random() * 4000) + 800,
      stars: Math.floor(Math.random() * 30000) + 8000,
      forks: Math.floor(Math.random() * 10000) + 3000,
      commits: Math.floor(Math.random() * 80) + 20,
      pullRequests: Math.floor(Math.random() * 40) + 8,
      issues: Math.floor(Math.random() * 30) + 4,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toLocaleDateString(),
      chartData: generateChartData(20, true, 4),
    },
    {
      name: "near/nearcore",
      contributions: Math.floor(Math.random() * 3000) + 600,
      stars: Math.floor(Math.random() * 20000) + 5000,
      forks: Math.floor(Math.random() * 8000) + 2000,
      commits: Math.floor(Math.random() * 60) + 15,
      pullRequests: Math.floor(Math.random() * 30) + 6,
      issues: Math.floor(Math.random() * 25) + 3,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toLocaleDateString(),
      chartData: generateChartData(20, Math.random() > 0.3, 6),
    },
    {
      name: "cosmos/cosmos-sdk",
      contributions: Math.floor(Math.random() * 2500) + 500,
      stars: Math.floor(Math.random() * 15000) + 4000,
      forks: Math.floor(Math.random() * 6000) + 1500,
      commits: Math.floor(Math.random() * 50) + 10,
      pullRequests: Math.floor(Math.random() * 25) + 5,
      issues: Math.floor(Math.random() * 20) + 2,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toLocaleDateString(),
      chartData: generateChartData(20, Math.random() > 0.4, 5),
    },
    {
      name: "polkadot-js/api",
      contributions: Math.floor(Math.random() * 2000) + 400,
      stars: Math.floor(Math.random() * 10000) + 3000,
      forks: Math.floor(Math.random() * 4000) + 1000,
      commits: Math.floor(Math.random() * 40) + 8,
      pullRequests: Math.floor(Math.random() * 20) + 4,
      issues: Math.floor(Math.random() * 15) + 2,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000).toLocaleDateString(),
      chartData: generateChartData(20, Math.random() > 0.5, 4),
    },
  ];

  // Activity feed
  const activityTypes = ["commit", "pull_request", "issue", "code_review", "fork", "star"];
  const activityVerbs = [
    "Committed to",
    "Opened a pull request in",
    "Reported an issue in",
    "Reviewed code in",
    "Forked",
    "Starred",
  ];

  const recentActivity = Array.from({ length: 10 }, (_, i) => {
    const activityIndex = Math.floor(Math.random() * activityTypes.length);
    const projectIndex = Math.floor(Math.random() * projects.length);
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    let timeAgo = "";
    if (daysAgo > 0) {
      timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    } else if (hoursAgo > 0) {
      timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    }

    return {
      id: i,
      type: activityTypes[activityIndex],
      verb: activityVerbs[activityIndex],
      project: projects[projectIndex].name,
      timestamp: new Date(Date.now() - (daysAgo * 86400000) - (hoursAgo * 3600000) - (minutesAgo * 60000)).toISOString(),
      timeAgo,
      description: activityTypes[activityIndex] === "commit"
        ? `Update ${['documentation', 'core functionality', 'tests', 'dependencies', 'examples'][Math.floor(Math.random() * 5)]}`
        : activityTypes[activityIndex] === "pull_request"
          ? `Add ${['new feature', 'bugfix', 'performance improvement', 'refactoring', 'security patch'][Math.floor(Math.random() * 5)]}`
          : activityTypes[activityIndex] === "issue"
            ? `Report ${['bug', 'enhancement request', 'documentation issue', 'security vulnerability', 'performance issue'][Math.floor(Math.random() * 5)]}`
            : "",
    };
  });

  return json({
    developer,
    newDeveloper: res.data,
    repositories,
    ecosystems,
    recentActivity,
  });
};

export default function DeveloperPage() {
  const { developer, newDeveloper, ecosystems, repositories, recentActivity } = useLoaderData<typeof loader>();

  // Simple line chart component
  const MiniChart = ({ data, color = "primary", height = 40 }: { data: number[], color?: string, height?: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    return (
      <div className="w-full h-full" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${data.length} ${range || 1}`} preserveAspectRatio="none">
          <path
            d={data.map((d, i) => `${i === 0 ? "M" : "L"} ${i} ${max - d + min}`).join(" ")}
            fill="none"
            stroke={`var(--${color})`}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        </svg>
      </div>
    );
  };

  // Growth indicator component
  const GrowthIndicator = ({ value, isPositive = true }: { value: string, isPositive?: boolean }) => {
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-success" : "text-danger"}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        <span>{value}</span>
      </div>
    );
  };

  // Activity icon component
  const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
    case "commit":
      return <GitCommit size={16} className="text-primary" />;
    case "pull_request":
      return <GitPullRequest size={16} className="text-secondary" />;
    case "issue":
      return <div className="w-4 h-4 rounded-full bg-warning flex items-center justify-center text-xs text-white">!</div>;
    case "code_review":
      return <Eye size={16} className="text-success" />;
    case "fork":
      return <GitBranch size={16} className="text-indigo-500" />;
    case "star":
      return <div className="w-4 h-4 text-yellow-500">★</div>;
    default:
      return <Code2 size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 py-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <ProfileCardWidget className="mb-6" developer={newDeveloper!} />
        <MetricOverviewWidget className="mb-6" dataSource={newDeveloper!.statistics} />

        {/* Activity Chart */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none mb-6">
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
        </Card>

        {/* Ecosystems & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ecosystems */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ecosystem Contributions</h3>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              <div className="space-y-6">
                {ecosystems.map((ecosystem, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Link to={`/ecosystem/${ecosystem.name.toLowerCase()}`} className="text-sm font-medium text-primary hover:underline">
                          {ecosystem.name}
                        </Link>
                        <GrowthIndicator value={ecosystem.growth} isPositive={ecosystem.isPositive} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ecosystem.percentage}%</span>
                        <span className="text-xs text-gray-500">({ecosystem.contributions.toLocaleString()})</span>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="flex-grow">
                        <Progress
                          value={ecosystem.percentage}
                          size="sm"
                          color={
                            index === 0 ? "primary" :
                              index === 1 ? "secondary" :
                                index === 2 ? "success" :
                                  index === 3 ? "warning" : "danger"
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="w-16 h-8 flex-shrink-0">
                        <MiniChart
                          data={ecosystem.chartData}
                          color={ecosystem.isPositive ? "success" : "danger"}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-secondary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span>{activity.verb} </span>
                          <Link to={`/repository/${activity.project}`} className="font-medium text-primary hover:underline">
                            {activity.project}
                          </Link>
                          {activity.description && <span>: {activity.description}</span>}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

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

        {/* All Activity Feed */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none mb-6">
          <CardHeader className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Feed</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span>{activity.verb} </span>
                        <Link to={`/repository/${activity.project}`} className="font-medium text-primary hover:underline">
                          {activity.project}
                        </Link>
                        {activity.description && <span>: {activity.description}</span>}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.timeAgo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
