import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card, CardBody, CardHeader, Divider,
} from "@nextui-org/react";
import { Warehouse } from "lucide-react";

import { getTitle } from "@/utils/app";

import { fetchStatistics } from "~/ecosystem/repository";
import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";

import MetricOverview from "./MetricOverview";

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
  const ecosystemName = decodeURIComponent(ctx.params.name!);
  const { data: statistics } = await fetchStatistics(ecosystemName);

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

  return json({
    ecosystem: ecosystemName,
    statistics,
    developerStats,
  });
};

export default function EcosystemPage() {
  const { ecosystem, statistics, developerStats } = useLoaderData<typeof loader>();

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

        <MetricOverview className="mb-10" dataSource={statistics} />

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
        <RepositoryRankViewWidget className="mb-10" dataSource={statistics.repositories} />
        <DeveloperRankViewWidget dataSource={statistics.developers} />
      </div>
    </div>
  );
}
