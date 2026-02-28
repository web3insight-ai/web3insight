import type { LucideIcon } from "lucide-react";
import {
  AlertTriangleIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  DatabaseIcon,
  Globe2Icon,
  Loader2Icon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormalizedToolPart } from "./normalize-tool-part";

type ToolTone = "attention" | "completed" | "error" | "muted" | "running";

interface ToolCardCopy {
  icon?: LucideIcon;
  subtitle: string;
  title: string;
}

interface ToolStatusConfig {
  Icon: LucideIcon;
  label: string;
  tone: ToolTone;
}

// Reason: Maps tool names to human-readable labels and descriptions
// that are displayed in the tool execution card UI. Each tool corresponds
// to a Web3 analytics capability in the copilot.
const TOOL_COPY: Record<string, ToolCardCopy> = {
  getPlatformOverview: {
    title: "Platform Stats",
    subtitle: "Platform statistics",
    icon: BarChart3Icon,
  },
  rankEcosystems: {
    title: "Ecosystem Ranking",
    subtitle: "Ecosystems by activity",
    icon: Globe2Icon,
  },
  getRecentContributorTrends: {
    title: "Growth Trends",
    subtitle: "Contributor growth",
    icon: TrendingUpIcon,
  },
  getTrendingRepositories: {
    title: "Trending Repos",
    subtitle: "Trending repositories",
    icon: TrendingUpIcon,
  },
  getHotRepositories: {
    title: "Hot Repos",
    subtitle: "Hot repositories",
    icon: SparklesIcon,
  },
  rankContributors: {
    title: "Top Contributors",
    subtitle: "Top contributors",
    icon: UsersIcon,
  },
  rankRepositories: {
    title: "Top Repositories",
    subtitle: "Top repositories",
    icon: BarChart3Icon,
  },
  getDeveloperProfile: {
    title: "Developer Profile",
    subtitle: "Developer profile",
    icon: UsersIcon,
  },
  getDeveloperTopRepositories: {
    title: "Developer Repos",
    subtitle: "Top repositories",
    icon: DatabaseIcon,
  },
  getCountryDistribution: {
    title: "Country Distribution",
    subtitle: "Developer locations",
    icon: Globe2Icon,
  },
  compareEcosystems: {
    title: "Ecosystem Comparison",
    subtitle: "Comparing ecosystems",
    icon: Globe2Icon,
  },
  countRepositories: {
    title: "Repository Count",
    subtitle: "Repository count",
    icon: DatabaseIcon,
  },
  countContributors: {
    title: "Contributor Count",
    subtitle: "Contributor count",
    icon: UsersIcon,
  },
  countEcosystems: {
    title: "Ecosystem Count",
    subtitle: "Ecosystem count",
    icon: Globe2Icon,
  },
  getContributorGrowth: {
    title: "Contributor Growth",
    subtitle: "Contributor growth",
    icon: TrendingUpIcon,
  },
  getYearlyReport: {
    title: "Annual Report",
    subtitle: "Annual report data",
    icon: BarChart3Icon,
  },
  queryWeb3Data: {
    title: "Data Query",
    subtitle: "Custom analytics query",
    icon: SearchIcon,
  },
};

function getToolCopy(toolName: string): ToolCardCopy {
  return (
    TOOL_COPY[toolName] ?? {
      title: toolName.replace(/([A-Z])/g, " $1").trim(),
      subtitle: toolName.replace(/_/g, " "),
    }
  );
}

function getToolStatus(state: string): ToolStatusConfig {
  switch (state) {
  case "output-available":
    return {
      label: "Done",
      tone: "completed",
      Icon: CheckCircle2Icon,
    };
  case "output-error":
    return {
      label: "Failed",
      tone: "error",
      Icon: AlertTriangleIcon,
    };
  case "output-denied":
    return {
      label: "Stopped",
      tone: "muted",
      Icon: AlertTriangleIcon,
    };
  case "approval-requested":
  case "approval-responded":
    return {
      label: "Pending",
      tone: "attention",
      Icon: SparklesIcon,
    };
  default:
    return {
      label: "Running",
      tone: "running",
      Icon: Loader2Icon,
    };
  }
}

// Reason: Compact tool status card shown for every tool invocation.
// Displays the tool name, subtitle, and a status badge. Completed tools
// show a subtle collapsed card so the user sees the full execution trail.
export function ToolPartCard({
  normalized,
}: {
  normalized: NormalizedToolPart;
}) {
  const toolCopy = getToolCopy(normalized.toolName);
  const statusConfig = getToolStatus(normalized.state);
  const isComplete = statusConfig.tone === "completed";
  const ToolIcon = toolCopy.icon ?? DatabaseIcon;

  return (
    <div
      className={cn(
        "mb-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
        isComplete
          ? "bg-gray-50/60 dark:bg-white/[0.03]"
          : "bg-gray-50 dark:bg-white/[0.05]",
      )}
    >
      <ToolIcon
        className={cn(
          "size-3.5 shrink-0",
          isComplete
            ? "text-gray-400 dark:text-gray-500"
            : "text-gray-500 dark:text-gray-400",
        )}
      />

      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span
          className={cn(
            "truncate text-[13px] font-medium",
            isComplete
              ? "text-gray-500 dark:text-gray-400"
              : "text-gray-700 dark:text-gray-200",
          )}
        >
          {toolCopy.title}
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="truncate text-[13px] text-gray-400 dark:text-gray-500">
          {toolCopy.subtitle}
        </span>
      </div>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 text-[11px] font-medium",
          statusConfig.tone === "running" && "text-blue-500 dark:text-blue-400",
          statusConfig.tone === "completed" &&
            "text-teal-600 dark:text-teal-400",
          statusConfig.tone === "error" && "text-red-500 dark:text-red-400",
          statusConfig.tone === "attention" && "text-sky-600 dark:text-sky-400",
          statusConfig.tone === "muted" && "text-gray-400 dark:text-gray-500",
        )}
      >
        <statusConfig.Icon
          className={cn("size-3", {
            "animate-spin": statusConfig.tone === "running",
          })}
        />
        {statusConfig.label}
      </span>
    </div>
  );
}
