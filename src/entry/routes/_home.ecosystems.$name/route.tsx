import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Warehouse } from "lucide-react";

import { getTitle } from "@/utils/app";

import { fetchStatistics } from "~/ecosystem/repository";
import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";

import ClientOnly from "../../components/ClientOnly";

import MetricOverview from "./MetricOverview";
import TrendCard from "./TrendCard";

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

export const loader = async (ctx: LoaderFunctionArgs) => {
  const ecosystemName = decodeURIComponent(ctx.params.name!);
  const { data: statistics } = await fetchStatistics(ecosystemName);

  return json({ ecosystem: ecosystemName, statistics });
};

export default function EcosystemPage() {
  const { ecosystem, statistics } = useLoaderData<typeof loader>();

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
        <ClientOnly>
          <TrendCard dataSource={statistics.trend} />
        </ClientOnly>
        <RepositoryRankViewWidget className="mb-10" dataSource={statistics.repositories} />
        <DeveloperRankViewWidget dataSource={statistics.developers} />
      </div>
    </div>
  );
}
