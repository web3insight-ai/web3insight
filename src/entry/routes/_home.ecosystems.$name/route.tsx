import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Warehouse, Github, Users } from "lucide-react";

import { getTitle } from "@/utils/app";
import ChartCard from "@/components/control/chart-card";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/loading";

import { fetchStatistics } from "~/ecosystem/repository";
import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";

import ClientOnly from "../../components/ClientOnly";

import { resolveChartOptions } from "./helper";
import MetricOverview from "./MetricOverview";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const baseTitle = `Ecosystem - ${getTitle()}`;
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

export const loader = async (ctx: LoaderFunctionArgs) => {
  const ecosystemName = decodeURIComponent(ctx.params.name!);
  const { data: statistics } = await fetchStatistics(ecosystemName);

  return json({ ecosystem: ecosystemName, statistics });
};

export default function EcosystemPage() {
  const { ecosystem, statistics } = useLoaderData<typeof loader>();
  
  // Show loading skeleton while data is being fetched
  const isLoading = !statistics || !statistics.developers || !statistics.repositories;

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
      <div className="w-full max-w-content mx-auto px-6">
        {/* Header and Overview */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Warehouse size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{ecosystem}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">Ecosystem Analytics</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            Comprehensive developer analytics and insights for the {ecosystem} ecosystem.
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          {isLoading ? (
            <CardSkeleton count={4} />
          ) : (
            <MetricOverview className="mb-12" dataSource={statistics} />
          )}
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <ClientOnly>
            {isLoading ? (
              <ChartSkeleton title="Developer Activity Trend" height="320px" />
            ) : (
              <ChartCard
                className="mb-10"
                style={{ height: "320px" }}
                title="Developer Activity Trend"
                option={resolveChartOptions(statistics.trend)}
              />
            )}
          </ClientOnly>
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          {isLoading ? (
            <TableSkeleton 
              title="Top Repositories" 
              icon={<Github size={18} className="text-primary" />}
              rows={10}
              columns={6}
            />
          ) : (
            <RepositoryRankViewWidget className="mb-10" dataSource={statistics.repositories} />
          )}
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          {isLoading ? (
            <TableSkeleton 
              title="Top Contributors" 
              icon={<Users size={18} className="text-secondary" />}
              rows={10}
              columns={4}
            />
          ) : (
            <DeveloperRankViewWidget dataSource={statistics.developers} />
          )}
        </div>
      </div>
    </div>
  );
}
