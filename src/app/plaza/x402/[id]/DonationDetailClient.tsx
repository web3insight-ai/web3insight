"use client";

import { Avatar, Button, Chip, Link } from "@nextui-org/react";
import {
  Star,
  GitFork,
  AlertCircle,
  Github,
  Globe,
  ArrowLeft,
  Copy,
  Check,
  LinkIcon,
  ExternalLink,
  UserCheck,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import ReactECharts from "echarts-for-react";
import ClientOnly from "$/ClientOnly";
import { DonateButton } from "~/x402/widgets/DonateButton";
import { useGitHubStats } from "@/hooks/useGitHubStats";
import type {
  DonateRepo,
  DonationLink,
  RepoActiveDeveloperRecord,
} from "@/lib/api/types";
import type {
  Developer,
  DeveloperContribution,
  DeveloperEcosystems,
} from "~/developer/typing";

interface DonationDetailClientProps {
  donateRepo: DonateRepo;
  developer: Developer | null;
  contributions: DeveloperContribution[];
  ecosystems: DeveloperEcosystems | null;
  activeDevelopers: RepoActiveDeveloperRecord[];
}

const REPO_LABELS = ["repository", "repo", "github"];

function isRepoLink(link: DonationLink): boolean {
  return REPO_LABELS.includes(link.label.toLowerCase());
}

function getLinkDisplayText(link: DonationLink): string {
  try {
    const url = new URL(link.url);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return link.label;
  }
}

function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-");
  if (!year || !month) return value;

  const monthIndex = Number.parseInt(month, 10) - 1;
  if (Number.isNaN(monthIndex)) return value;

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
    }).format(new Date(Date.UTC(Number.parseInt(year, 10), monthIndex, 1)));
  } catch {
    return value;
  }
}

function resolveContributionChartOptions(
  contributions: DeveloperContribution[],
) {
  const dates = contributions.map((c) => {
    const [year, month] = c.date.split("-");
    return `${month}/${year?.slice(2)}`;
  });
  const values = contributions.map((c) => c.total);

  return {
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { fontSize: 10, color: "#6b7280" },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e5e7eb" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: "#6b7280" },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
    },
    series: [
      {
        data: values,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#10b981", width: 2 },
        itemStyle: { color: "#10b981" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.2)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" },
            ],
          },
        },
      },
    ],
  };
}

export default function DonationDetailClient({
  donateRepo,
  developer,
  contributions,
  ecosystems,
  activeDevelopers,
}: DonationDetailClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { repo_info, repo_donate_data } = donateRepo;
  const hasDonationConfig = repo_donate_data?.payTo;
  const links = repo_donate_data?.links ?? [];

  // Reason: Filter out repository links for external links section
  const otherLinks = links.filter((link) => !isRepoLink(link));

  // Reason: Extract additional repo info from GitHub API response
  const repoDetails = repo_info as unknown as Record<string, unknown>;
  const language = repoDetails.language as string | undefined;
  const topics = (repoDetails.topics as string[]) || [];
  const homepage = repoDetails.homepage as string | undefined;
  const forksCount = (repoDetails.forks_count as number) || 0;
  const openIssuesCount = (repoDetails.open_issues_count as number) || 0;

  // Reason: Get developer GitHub stats for grade badge
  const { data: githubData, loading: githubLoading } = useGitHubStats(
    developer?.username || null,
  );

  // Reason: Calculate active developers statistics
  const activeDeveloperMap = activeDevelopers.reduce<Map<string, number>>(
    (map, entry) => {
      map.set(entry.month, entry.developers);
      return map;
    },
    new Map(),
  );

  const monthKeys: string[] = [];
  const now = new Date();
  for (let offset = 11; offset >= 0; offset -= 1) {
    const current = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    const key = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}`;
    monthKeys.push(key);
  }

  const activeDeveloperChartValues = monthKeys.map(
    (monthKey) => activeDeveloperMap.get(monthKey) ?? 0,
  );

  const latestActiveDeveloper =
    monthKeys.length > 0
      ? {
        month: monthKeys[monthKeys.length - 1],
        developers:
            activeDeveloperChartValues[activeDeveloperChartValues.length - 1] ??
            0,
      }
      : null;
  const previousActiveDeveloper =
    monthKeys.length > 1
      ? {
        month: monthKeys[monthKeys.length - 2],
        developers:
            activeDeveloperChartValues[activeDeveloperChartValues.length - 2] ??
            0,
      }
      : null;
  const activeDeveloperChange =
    latestActiveDeveloper && previousActiveDeveloper
      ? latestActiveDeveloper.developers - previousActiveDeveloper.developers
      : null;

  const averageActiveDevelopers =
    monthKeys.length > 0
      ? Math.round(
        activeDeveloperChartValues.reduce((sum, value) => sum + value, 0) /
            monthKeys.length,
      )
      : null;

  const peakIndex =
    activeDeveloperChartValues.length > 0
      ? activeDeveloperChartValues.reduce(
        (peak, value, index, array) => (value > array[peak] ? index : peak),
        0,
      )
      : null;

  const peakActiveDeveloper =
    peakIndex !== null && peakIndex !== undefined
      ? {
        month: monthKeys[peakIndex],
        developers: activeDeveloperChartValues[peakIndex],
      }
      : null;

  const activeDeveloperAxisLabels = monthKeys.map(formatMonthLabel);
  // Reason: Check if there's any non-zero value in the chart data
  const hasActiveDeveloperData = activeDeveloperChartValues.some((v) => v > 0);
  const maxActiveDeveloperValue = Math.max(...activeDeveloperChartValues, 0);
  const computedYAxisMax =
    maxActiveDeveloperValue > 0
      ? Math.max(10, Math.ceil(maxActiveDeveloperValue / 10) * 10)
      : 10;

  const handleCopyAddress = async () => {
    if (!repo_donate_data?.payTo) return;
    try {
      await navigator.clipboard.writeText(repo_donate_data.payTo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent error
    }
  };

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark">
      <div className="w-full max-w-content mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="light"
            size="sm"
            startContent={<ArrowLeft size={16} />}
            onPress={() => router.push("/plaza/x402")}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 -ml-2 mb-4"
          >
            Back to x402 Donate
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                {repo_donate_data?.title || repo_info.full_name}
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                Support this open source project with crypto donations
              </p>
            </div>
          </div>
        </header>

        {/* Repository Card */}
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 mb-4">
          {/* Repo Header */}
          <div className="flex items-start gap-4 mb-4">
            <Avatar
              src={repo_info.owner.avatar_url}
              className="w-12 h-12 flex-shrink-0"
              radius="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <a
                  href={repo_info.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                >
                  <span className="truncate">{repo_info.full_name}</span>
                  <ExternalLink
                    size={14}
                    className="flex-shrink-0 text-gray-300"
                  />
                </a>
                {language && (
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-primary/10 text-primary"
                  >
                    {language}
                  </Chip>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Star size={14} />
                <span>{repo_info.stargazers_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork size={14} />
                <span>{forksCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle size={14} />
                <span>{openIssuesCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {(repo_donate_data?.description || repo_info.description) && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {repo_donate_data?.description || repo_info.description}
            </p>
          )}

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <a
              href={repo_info.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <Github size={14} />
              <span>View on GitHub</span>
            </a>
            {homepage && (
              <a
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <Globe size={14} />
                <span>Website</span>
              </a>
            )}
            {otherLinks.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                isExternal
                showAnchorIcon
                anchorIcon={<LinkIcon size={10} />}
                className="text-sm text-primary hover:underline"
              >
                {getLinkDisplayText(link)}
              </Link>
            ))}
          </div>

          {/* Topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {topics.slice(0, 10).map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Donation Section */}
          {hasDonationConfig ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {repo_donate_data.payTo.slice(0, 6)}...
                    {repo_donate_data.payTo.slice(-4)}
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={handleCopyAddress}
                    className="w-6 h-6 min-w-0"
                  >
                    {copied ? (
                      <Check size={12} className="text-green-500" />
                    ) : (
                      <Copy size={12} className="text-gray-400" />
                    )}
                  </Button>
                </div>
                <Chip size="sm" variant="flat" color="primary">
                  {repo_donate_data.network === "base-sepolia"
                    ? "Base Sepolia"
                    : "Base"}
                </Chip>
                <span>USDC</span>
                {repo_donate_data.defaultAmount && (
                  <span className="font-medium">
                    ${repo_donate_data.defaultAmount}
                  </span>
                )}
              </div>
              <DonateButton
                payTo={repo_donate_data.payTo}
                title={repo_donate_data.title || repo_info.full_name}
                defaultAmount={
                  typeof repo_donate_data.defaultAmount === "string"
                    ? parseFloat(repo_donate_data.defaultAmount)
                    : repo_donate_data.defaultAmount
                }
                recipients={repo_donate_data.recipients}
                network={repo_donate_data.network}
              />
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-sm text-gray-400">No donation config</span>
            </div>
          )}
        </div>

        {/* Active Developers Chart - only show when there's data */}
        {hasActiveDeveloperData && (
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={14} className="text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Active Developers
                  </h3>
                  {latestActiveDeveloper && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatMonthLabel(latestActiveDeveloper.month)}
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {averageActiveDevelopers !== null && (
                          <span>
                            Avg:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {averageActiveDevelopers}
                            </span>
                          </span>
                        )}
                        {peakActiveDeveloper && (
                          <span className="ml-3">
                            Peak {formatMonthLabel(peakActiveDeveloper.month)}:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {peakActiveDeveloper.developers}
                            </span>
                          </span>
                        )}
                        <span className="ml-3">
                          Months:{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {monthKeys.length}
                          </span>
                        </span>
                      </span>
                    </p>
                  )}
                </div>
              </div>
              {latestActiveDeveloper && (
                <div className="text-right">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {latestActiveDeveloper.developers}
                  </p>
                  {previousActiveDeveloper &&
                    activeDeveloperChange !== null && (
                    <p
                      className={`text-xs font-medium ${
                        activeDeveloperChange >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {activeDeveloperChange >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(activeDeveloperChange)} vs{" "}
                      {formatMonthLabel(previousActiveDeveloper.month)}
                    </p>
                  )}
                </div>
              )}
            </div>
            <ClientOnly>
              <div className="mt-4 h-[280px]">
                <ReactECharts
                  option={{
                    grid: {
                      left: "6%",
                      right: "3%",
                      top: "10%",
                      bottom: "2%",
                      containLabel: true,
                    },
                    tooltip: { trigger: "axis", fontSize: 10 },
                    xAxis: {
                      type: "category",
                      data: activeDeveloperAxisLabels,
                      axisLabel: {
                        interval: 0,
                        rotate: 45,
                        fontSize: 9,
                        color: "#1F2937",
                        margin: 12,
                      },
                      axisTick: { show: false },
                    },
                    yAxis: {
                      type: "value",
                      name: "Developers",
                      nameTextStyle: { fontSize: 9, color: "#1F2937" },
                      axisLabel: { fontSize: 9, color: "#1F2937" },
                      axisTick: { show: false },
                      min: 0,
                      max: computedYAxisMax,
                      boundaryGap: [0, 0.1],
                      splitLine: {
                        lineStyle: { color: "#E5E7EB", opacity: 0.5 },
                      },
                    },
                    series: [
                      {
                        data: activeDeveloperChartValues,
                        type: "bar",
                        itemStyle: { color: "#0EA5E9" },
                        barWidth: "45%",
                        emphasis: {
                          focus: "series",
                          itemStyle: { color: "#0284C7" },
                        },
                        label: {
                          show: true,
                          position: "top",
                          formatter: ({ value }: { value: number }) =>
                            (value ?? 0).toString(),
                          fontSize: 10,
                          color: "#0F172A",
                        },
                      },
                    ],
                  }}
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </ClientOnly>
          </div>
        )}

        {/* Creator Profile Section */}
        {developer && (
          <>
            <div className="flex items-center gap-2 mt-6 mb-4">
              <Github size={16} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Creator Profile
              </h2>
            </div>

            {/* Developer Card */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={developer.avatar}
                  className="w-12 h-12 flex-shrink-0"
                  radius="lg"
                  fallback={developer.nickname || developer.username}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
                        {developer.nickname || developer.username}
                      </h4>
                      {githubLoading ? (
                        <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : githubData?.stats?.rank ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {githubData.stats.rank}
                        </span>
                      ) : null}
                    </div>
                    <a
                      href={developer.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Github size={12} />
                      <span>@{developer.username}</span>
                    </a>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      <strong className="text-gray-900 dark:text-white">
                        {developer.statistics.repository}
                      </strong>{" "}
                      Repositories
                    </span>
                    {githubLoading ? (
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ) : githubData?.stats ? (
                      <>
                        <span>
                          <strong className="text-gray-900 dark:text-white">
                            {githubData.stats.totalStars}
                          </strong>{" "}
                          Stars
                        </span>
                        <span>
                          <strong className="text-gray-900 dark:text-white">
                            {githubData.stats.totalCommits}
                          </strong>{" "}
                          Commits (2025)
                        </span>
                      </>
                    ) : null}
                    <span>
                      <strong className="text-gray-900 dark:text-white">
                        {developer.statistics.codeReview}
                      </strong>{" "}
                      Reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ecosystems */}
            {ecosystems && ecosystems.ecosystems.length > 0 && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Ecosystems Contributed
                  </h3>
                  <span className="text-xs text-gray-400">
                    ({ecosystems.ecosystems.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ecosystems.ecosystems.map((eco) => (
                    <NextLink
                      key={eco.ecosystem}
                      href={`/ecosystems/${encodeURIComponent(eco.ecosystem)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      {eco.ecosystem}
                      {eco.repoCount !== undefined && eco.repoCount > 0 && (
                        <span className="text-gray-400 dark:text-gray-500">
                          ({eco.repoCount} repos)
                        </span>
                      )}
                    </NextLink>
                  ))}
                </div>
              </div>
            )}

            {/* Contribution Activity */}
            {contributions.length > 0 && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-2 mb-3">
                  <Github size={14} className="text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Contribution Activity
                  </h3>
                </div>
                <ClientOnly>
                  <div className="h-48">
                    <ReactECharts
                      option={resolveContributionChartOptions(contributions)}
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                </ClientOnly>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
