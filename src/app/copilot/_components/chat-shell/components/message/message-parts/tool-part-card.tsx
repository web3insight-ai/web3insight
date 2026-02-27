import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Database,
  Globe2,
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormalizedToolPart } from "./normalize-tool-part";

type ToolTone = "attention" | "error" | "muted" | "running";

interface ToolCardCopy {
  icon?: LucideIcon;
  runningDetail?: string;
  subtitle: string;
  title: string;
}

interface ToolStatusConfig {
  Icon: LucideIcon;
  detail: string;
  label: string;
  tone: ToolTone;
}

// Reason: Maps tool names to human-readable labels and descriptions
// that are displayed in the tool execution card UI. Each tool corresponds
// to a Web3 analytics capability in the copilot.
const TOOL_COPY: Record<string, ToolCardCopy> = {
  getPlatformOverview: {
    title: "Platform Stats",
    subtitle: "Fetching platform statistics",
    runningDetail: "Fetching platform statistics.",
    icon: BarChart3,
  },
  rankEcosystems: {
    title: "Ecosystem Ranking",
    subtitle: "Ranking ecosystems by activity",
    runningDetail: "Ranking ecosystems by activity.",
    icon: Globe2,
  },
  getRecentContributorTrends: {
    title: "Growth Trends",
    subtitle: "Analyzing contributor growth",
    runningDetail: "Analyzing contributor growth trends.",
    icon: TrendingUp,
  },
  getTrendingRepositories: {
    title: "Trending Repos",
    subtitle: "Finding trending repositories",
    runningDetail: "Finding trending repositories.",
    icon: TrendingUp,
  },
  getHotRepositories: {
    title: "Hot Repos",
    subtitle: "Discovering hot repositories",
    runningDetail: "Discovering hot repositories.",
    icon: Sparkles,
  },
  rankContributors: {
    title: "Top Contributors",
    subtitle: "Fetching top contributors",
    runningDetail: "Fetching top contributors.",
    icon: Users,
  },
  rankRepositories: {
    title: "Top Repositories",
    subtitle: "Ranking repositories",
    runningDetail: "Ranking repositories.",
    icon: BarChart3,
  },
  getDeveloperProfile: {
    title: "Developer Profile",
    subtitle: "Loading developer profile",
    runningDetail: "Loading developer profile data.",
    icon: Users,
  },
  getDeveloperTopRepositories: {
    title: "Developer Repos",
    subtitle: "Loading top repositories",
    runningDetail: "Loading top repositories.",
    icon: Database,
  },
  getCountryDistribution: {
    title: "Country Distribution",
    subtitle: "Analyzing developer locations",
    runningDetail: "Analyzing developer locations.",
    icon: Globe2,
  },
  compareEcosystems: {
    title: "Ecosystem Comparison",
    subtitle: "Comparing ecosystems",
    runningDetail: "Comparing ecosystems.",
    icon: Globe2,
  },
  countRepositories: {
    title: "Repository Count",
    subtitle: "Counting repositories",
    runningDetail: "Counting repositories.",
    icon: Database,
  },
  countContributors: {
    title: "Contributor Count",
    subtitle: "Counting contributors",
    runningDetail: "Counting contributors.",
    icon: Users,
  },
  countEcosystems: {
    title: "Ecosystem Count",
    subtitle: "Counting ecosystems",
    runningDetail: "Counting ecosystems.",
    icon: Globe2,
  },
  getContributorGrowth: {
    title: "Contributor Growth",
    subtitle: "Checking growth",
    runningDetail: "Checking contributor growth.",
    icon: TrendingUp,
  },
  getYearlyReport: {
    title: "Annual Report",
    subtitle: "Loading annual report data",
    runningDetail: "Loading annual report data.",
    icon: BarChart3,
  },
};

function getToolCopy(toolName: string): ToolCardCopy {
  return (
    TOOL_COPY[toolName] ?? {
      title: "Tool run",
      subtitle: toolName.replace(/_/g, " "),
    }
  );
}

function getToolStatus(state: string): ToolStatusConfig {
  switch (state) {
  case "output-error":
    return {
      label: "Failed",
      detail: "The tool encountered an error.",
      tone: "error",
      Icon: AlertTriangle,
    };
  case "input-streaming":
  case "input-available":
    return {
      label: "Working",
      detail: "Fetching data from the platform.",
      tone: "running",
      Icon: Loader2,
    };
  case "approval-requested":
  case "approval-responded":
    return {
      label: "Needs input",
      detail: "Waiting for more info to continue.",
      tone: "attention",
      Icon: Sparkles,
    };
  case "output-denied":
    return {
      label: "Stopped",
      detail: "The tool did not finish.",
      tone: "muted",
      Icon: AlertTriangle,
    };
  default:
    return {
      label: "Working",
      detail: "Fetching data from the platform.",
      tone: "running",
      Icon: Loader2,
    };
  }
}

// Reason: ToolPartCard is a compact loading/progress card that is ONLY
// shown while the tool is running or in an error state. When the tool
// completes successfully, this card is not rendered — the inline
// visualization takes its place in CopilotMessageParts.
export function ToolPartCard({
  normalized,
}: {
  normalized: NormalizedToolPart;
}) {
  const toolCopy = getToolCopy(normalized.toolName);
  const statusConfig = getToolStatus(normalized.state);
  const statusDetail = toolCopy.runningDetail ?? statusConfig.detail;
  const ToolIcon = toolCopy.icon ?? Database;
  const StatusIcon = statusConfig.Icon;

  const badgeClass = cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
    statusConfig.tone === "running" &&
      "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
    statusConfig.tone === "attention" &&
      "border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200",
    statusConfig.tone === "error" &&
      "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200",
    statusConfig.tone === "muted" &&
      "border-muted-foreground/20 bg-muted/40 text-muted-foreground",
  );

  return (
    <div className="mb-3 w-full rounded-xl border border-border/70 bg-muted/30 dark:border-border-dark/70 dark:bg-surface-dark/30">
      <div className="flex w-full items-start gap-3 px-4 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-xs dark:border-border-dark/60 dark:bg-background-dark/80">
          <ToolIcon className="size-4 text-muted-foreground" />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3 w-full">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground dark:text-foreground-dark">
                {toolCopy.title}
              </span>
              <span className="text-muted-foreground/70">&bull;</span>
              <span className="truncate text-sm text-muted-foreground">
                {toolCopy.subtitle}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">{statusDetail}</p>
          </div>

          <span className={badgeClass}>
            <StatusIcon
              className={cn("size-3.5", {
                "animate-spin": statusConfig.tone === "running",
              })}
            />
            {statusConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
}
