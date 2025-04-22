import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Card, CardBody, CardHeader, Divider,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Progress
} from "@nextui-org/react";
import { Github, Users, Warehouse, Zap, Code2, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { getTitle } from "@/utils/app";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const baseTitle = `Ecosystem - ${getTitle()}`
  const title = data ? `${data.ecosystem} ${baseTitle}` : baseTitle;

  return [
    { title },
    { property: "og:title", content: title },
    {
      name: "description",
      content: data
        ? `Detailed metrics and analytics for the ${data.ecosystem} ecosystem. Track developer activity, contributions, and growth.`
        : "A comprehensive metric system for evaluating Web3 Ecosystems.",
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
  const ecosystemName = ctx.params.name;

  // In a real application, you would fetch actual ecosystem data
  // For this example, we're creating mock data based on the ecosystem name

  const developerStats = {
    totalDevelopers: Math.floor(Math.random() * 3000) + 1000,
    coreDevelopers: Math.floor(Math.random() * 800) + 200,
    monthlyCommits: Math.floor(Math.random() * 20000) + 5000,
    activeDevelopers: Math.floor(Math.random() * 2000) + 500,
    growth: Math.random() > 0.2 ? `+${(Math.random() * 15).toFixed(1)}%` : `-${(Math.random() * 5).toFixed(1)}%`,
    isPositive: Math.random() > 0.2,
    chartData: generateChartData(24, Math.random() > 0.2, 8),
    developersByMonth: [
      { month: "Jan", count: Math.floor(Math.random() * 800) + 400 },
      { month: "Feb", count: Math.floor(Math.random() * 800) + 400 },
      { month: "Mar", count: Math.floor(Math.random() * 800) + 400 },
      { month: "Apr", count: Math.floor(Math.random() * 800) + 400 },
      { month: "May", count: Math.floor(Math.random() * 800) + 400 },
      { month: "Jun", count: Math.floor(Math.random() * 800) + 400 }
    ],
    developersByType: [
      { type: "Full-time", percentage: Math.floor(Math.random() * 30) + 50, count: Math.floor(Math.random() * 1200) + 400 },
      { type: "Part-time", percentage: Math.floor(Math.random() * 20) + 20, count: Math.floor(Math.random() * 800) + 200 },
      { type: "Occasional", percentage: Math.floor(Math.random() * 15) + 5, count: Math.floor(Math.random() * 400) + 100 }
    ],
    developersByTenure: [
      { tenure: "< 1 year", percentage: Math.floor(Math.random() * 20) + 10, count: Math.floor(Math.random() * 600) + 100 },
      { tenure: "1-2 years", percentage: Math.floor(Math.random() * 20) + 20, count: Math.floor(Math.random() * 800) + 200 },
      { tenure: "2-3 years", percentage: Math.floor(Math.random() * 20) + 25, count: Math.floor(Math.random() * 1000) + 300 },
      { tenure: "3+ years", percentage: Math.floor(Math.random() * 20) + 15, count: Math.floor(Math.random() * 600) + 200 }
    ],
    developerLocations: [
      { region: "North America", percentage: Math.floor(Math.random() * 10) + 25, count: Math.floor(Math.random() * 800) + 300 },
      { region: "Europe", percentage: Math.floor(Math.random() * 10) + 20, count: Math.floor(Math.random() * 700) + 200 },
      { region: "Asia", percentage: Math.floor(Math.random() * 10) + 18, count: Math.floor(Math.random() * 600) + 200 },
      { region: "South America", percentage: Math.floor(Math.random() * 8) + 5, count: Math.floor(Math.random() * 300) + 50 },
      { region: "Africa", percentage: Math.floor(Math.random() * 6) + 2, count: Math.floor(Math.random() * 200) + 20 },
      { region: "Oceania", percentage: Math.floor(Math.random() * 5) + 1, count: Math.floor(Math.random() * 150) + 20 }
    ]
  };

  // Top repositories in this ecosystem
  const topRepositories = [
    {
      name: `${ecosystemName}/core`,
      stars: Math.floor(Math.random() * 15000) + 5000,
      forks: Math.floor(Math.random() * 5000) + 1000,
      commits: Math.floor(Math.random() * 10000) + 5000,
      contributors: Math.floor(Math.random() * 300) + 100,
      activity: generateChartData(20, Math.random() > 0.3, 6),
      growth: Math.random() > 0.7 ? `+${(Math.random() * 20).toFixed(1)}%` : `-${(Math.random() * 5).toFixed(1)}%`,
      isPositive: Math.random() > 0.3
    },
    {
      name: `${ecosystemName}/sdk`,
      stars: Math.floor(Math.random() * 10000) + 3000,
      forks: Math.floor(Math.random() * 3000) + 800,
      commits: Math.floor(Math.random() * 8000) + 4000,
      contributors: Math.floor(Math.random() * 200) + 80,
      activity: generateChartData(20, Math.random() > 0.3, 6),
      growth: Math.random() > 0.7 ? `+${(Math.random() * 20).toFixed(1)}%` : `-${(Math.random() * 5).toFixed(1)}%`,
      isPositive: Math.random() > 0.3
    },
    {
      name: `${ecosystemName}/docs`,
      stars: Math.floor(Math.random() * 5000) + 2000,
      forks: Math.floor(Math.random() * 2000) + 500,
      commits: Math.floor(Math.random() * 6000) + 3000,
      contributors: Math.floor(Math.random() * 150) + 60,
      activity: generateChartData(20, Math.random() > 0.3, 6),
      growth: Math.random() > 0.7 ? `+${(Math.random() * 20).toFixed(1)}%` : `-${(Math.random() * 5).toFixed(1)}%`,
      isPositive: Math.random() > 0.3
    },
    {
      name: `${ecosystemName}-community/examples`,
      stars: Math.floor(Math.random() * 4000) + 1000,
      forks: Math.floor(Math.random() * 1500) + 300,
      commits: Math.floor(Math.random() * 5000) + 2000,
      contributors: Math.floor(Math.random() * 100) + 40,
      activity: generateChartData(20, Math.random() > 0.3, 6),
      growth: Math.random() > 0.7 ? `+${(Math.random() * 20).toFixed(1)}%` : `-${(Math.random() * 5).toFixed(1)}%`,
      isPositive: Math.random() > 0.3
    },
    {
      name: `${ecosystemName}-labs/tools`,
      stars: Math.floor(Math.random() * 3000) + 800,
      forks: Math.floor(Math.random() * 1000) + 200,
      commits: Math.floor(Math.random() * 4000) + 1000,
      contributors: Math.floor(Math.random() * 80) + 30,
      activity: generateChartData(20, Math.random() > 0.3, 6),
      growth: Math.random() > 0.7 ? `+${(Math.random() * 20).toFixed(1)}%` : `-${(Math.random() * 5).toFixed(1)}%`,
      isPositive: Math.random() > 0.3
    },
  ];

  // Top developers in this ecosystem
  const topDevelopers = [
    {
      id: "dev1",
      name: "alex_dev",
      handle: "@alex_dev",
      contribution: Math.floor(Math.random() * 20000) + 10000,
      growth: `+${(Math.random() * 15).toFixed(1)}%`,
      isPositive: true,
      chartData: generateChartData(20, true, 6),
      projects: [`${ecosystemName}/core`, `${ecosystemName}/sdk`, `${ecosystemName}-community/examples`]
    },
    {
      id: "dev2",
      name: "samantha.eth",
      handle: "@samantha",
      contribution: Math.floor(Math.random() * 18000) + 8000,
      growth: `+${(Math.random() * 12).toFixed(1)}%`,
      isPositive: true,
      chartData: generateChartData(20, true, 5),
      projects: [`${ecosystemName}/core`, `${ecosystemName}/docs`]
    },
    {
      id: "dev3",
      name: "dev_master",
      handle: "@dev_master",
      contribution: Math.floor(Math.random() * 15000) + 7000,
      growth: `+${(Math.random() * 10).toFixed(1)}%`,
      isPositive: true,
      chartData: generateChartData(20, true, 4),
      projects: [`${ecosystemName}/sdk`, `${ecosystemName}-labs/tools`]
    },
    {
      id: "dev4",
      name: "crypto_coder",
      handle: "@crypto_coder",
      contribution: Math.floor(Math.random() * 12000) + 6000,
      growth: Math.random() > 0.8 ? `-${(Math.random() * 5).toFixed(1)}%` : `+${(Math.random() * 8).toFixed(1)}%`,
      isPositive: Math.random() > 0.8 ? false : true,
      chartData: generateChartData(20, Math.random() > 0.8 ? false : true, 5),
      projects: [`${ecosystemName}/core`, `${ecosystemName}-community/examples`]
    },
    {
      id: "dev5",
      name: "blockchain_ninja",
      handle: "@blockchain_ninja",
      contribution: Math.floor(Math.random() * 10000) + 5000,
      growth: Math.random() > 0.8 ? `-${(Math.random() * 5).toFixed(1)}%` : `+${(Math.random() * 8).toFixed(1)}%`,
      isPositive: Math.random() > 0.8 ? false : true,
      chartData: generateChartData(20, Math.random() > 0.8 ? false : true, 4),
      projects: [`${ecosystemName}/docs`, `${ecosystemName}-labs/tools`]
    }
  ];

  return json({
    ecosystem: ecosystemName,
    developerStats,
    topRepositories,
    topDevelopers
  });
};

export default function EcosystemPage() {
  const { ecosystem, developerStats, topRepositories, topDevelopers } = useLoaderData<typeof loader>();

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

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 py-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Warehouse size={24} className="text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{ecosystem} Ecosystem</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Comprehensive developer analytics and insights for the {ecosystem} ecosystem.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Developers</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {developerStats.totalDevelopers.toLocaleString()}
                  </h2>
                  <GrowthIndicator value={developerStats.growth} isPositive={developerStats.isPositive} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-xl flex-shrink-0">
                  <Zap size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Core Developers</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {developerStats.coreDevelopers.toLocaleString()}
                  </h2>
                  <GrowthIndicator value={developerStats.growth} isPositive={developerStats.isPositive} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
                  <Code2 size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Commits</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {developerStats.monthlyCommits.toLocaleString()}
                  </h2>
                  <GrowthIndicator value={`+${(Math.random() * 10).toFixed(1)}%`} isPositive={true} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl flex-shrink-0">
                  <TrendingUp size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Developers</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {developerStats.activeDevelopers.toLocaleString()}
                  </h2>
                  <GrowthIndicator value={`+${(Math.random() * 12).toFixed(1)}%`} isPositive={true} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Developer Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Developer Location */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <CardHeader className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Developer Location</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              <div className="space-y-6">
                {developerStats.developerLocations.map((location, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{location.region}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{location.percentage}%</span>
                        <span className="text-xs text-gray-500">({location.count.toLocaleString()})</span>
                      </div>
                    </div>
                    <Progress
                      value={location.percentage}
                      size="sm"
                      color={
                        index === 0 ? "primary" :
                          index === 1 ? "secondary" :
                            index === 2 ? "success" :
                              index === 3 ? "warning" :
                                index === 4 ? "danger" : "default"
                      }
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Developer Types */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <CardHeader className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Developer Type Distribution</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              <div className="space-y-6">
                {developerStats.developersByType.map((type, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.percentage}%</span>
                        <span className="text-xs text-gray-500">({type.count.toLocaleString()})</span>
                      </div>
                    </div>
                    <Progress
                      value={type.percentage}
                      size="sm"
                      color={
                        index === 0 ? "success" :
                          index === 1 ? "primary" : "warning"
                      }
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Developer Tenure</h4>
                <div className="space-y-6">
                  {developerStats.developersByTenure.map((tenure, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tenure.tenure}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tenure.percentage}%</span>
                          <span className="text-xs text-gray-500">({tenure.count.toLocaleString()})</span>
                        </div>
                      </div>
                      <Progress
                        value={tenure.percentage}
                        size="sm"
                        color={
                          index === 0 ? "default" :
                            index === 1 ? "primary" :
                              index === 2 ? "secondary" : "success"
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Developer Activity By Month */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-none mb-10">
          <CardHeader className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Developer Activity Trend</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            <div className="h-64 w-full">
              <MiniChart data={developerStats.chartData} height={250} />
            </div>
            <div className="mt-6 grid grid-cols-6 gap-4">
              {developerStats.developersByMonth.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.month}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Repositories */}
        <div className="mb-10">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Github size={18} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Repositories</h3>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-0 py-0">
              <Table aria-label="Top repositories in ecosystem">
                <TableHeader>
                  <TableColumn>#</TableColumn>
                  <TableColumn>REPOSITORY</TableColumn>
                  <TableColumn>STARS</TableColumn>
                  <TableColumn>FORKS</TableColumn>
                  <TableColumn>COMMITS</TableColumn>
                  <TableColumn>CONTRIBUTORS</TableColumn>
                  <TableColumn>ACTIVITY</TableColumn>
                </TableHeader>
                <TableBody>
                  {topRepositories.map((repo, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                          ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                            index === 1 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                          text-xs font-medium`}>{index + 1}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Link to={`/repository/${repo.name}`} className="font-medium text-primary hover:underline">
                            {repo.name}
                          </Link>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${repo.isPositive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                              'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            }`}>
                            {repo.growth}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{repo.stars.toLocaleString()}</TableCell>
                      <TableCell>{repo.forks.toLocaleString()}</TableCell>
                      <TableCell>{repo.commits.toLocaleString()}</TableCell>
                      <TableCell>{repo.contributors.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="w-20 h-8">
                          <MiniChart data={repo.activity} color={repo.isPositive ? "success" : "danger"} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Top Developers */}
        <div className="mb-10">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-secondary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Contributors</h3>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-0 py-0">
              <Table aria-label="Top developers in ecosystem">
                <TableHeader>
                  <TableColumn>#</TableColumn>
                  <TableColumn>DEVELOPER</TableColumn>
                  <TableColumn>CONTRIBUTIONS</TableColumn>
                  <TableColumn>GROWTH</TableColumn>
                  <TableColumn>TOP PROJECTS</TableColumn>
                  <TableColumn>ACTIVITY</TableColumn>
                </TableHeader>
                <TableBody>
                  {topDevelopers.map((developer, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                          ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                            index === 1 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                          text-xs font-medium`}>{index + 1}</span>
                      </TableCell>
                      <TableCell>
                        <Link to={`/developer/${developer.id}`} className="font-medium text-primary hover:underline">
                          {developer.handle}
                        </Link>
                      </TableCell>
                      <TableCell>{developer.contribution.toLocaleString()}</TableCell>
                      <TableCell>
                        <GrowthIndicator value={developer.growth} isPositive={developer.isPositive} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {developer.projects.slice(0, 2).map((project, pIndex) => (
                            <span key={pIndex} className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                              {project}
                            </span>
                          ))}
                          {developer.projects.length > 2 && (
                            <span className="text-xs text-gray-500">+{developer.projects.length - 2} more</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20 h-8">
                          <MiniChart data={developer.chartData} color={developer.isPositive ? "success" : "danger"} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
