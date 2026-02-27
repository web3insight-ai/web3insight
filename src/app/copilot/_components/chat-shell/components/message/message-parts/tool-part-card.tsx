import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { getToolName, isToolUIPart } from "ai";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Globe2,
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CopilotUIMessage } from "~/ai/copilot-types";

export type ToolPart = ToolUIPart | DynamicToolUIPart;

type ToolTone = "attention" | "error" | "muted" | "running" | "success";

interface ToolCardCopy {
  detail?: string;
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
  getOverallStatistics: {
    title: "Platform Stats",
    subtitle: "Fetching platform statistics",
    detail: "Pulling overall platform metrics",
    runningDetail: "Fetching platform statistics.",
    icon: BarChart3,
  },
  getEcosystemRanking: {
    title: "Ecosystem Ranking",
    subtitle: "Ranking ecosystems by activity",
    detail: "Comparing ecosystem developer activity",
    runningDetail: "Ranking ecosystems by activity.",
    icon: Globe2,
  },
  getContributorGrowthTrend: {
    title: "Growth Trends",
    subtitle: "Analyzing contributor growth",
    detail: "Tracking developer growth over time",
    runningDetail: "Analyzing contributor growth trends.",
    icon: TrendingUp,
  },
  getTrendingRepositories: {
    title: "Trending Repos",
    subtitle: "Finding trending repositories",
    detail: "Discovering repositories gaining traction",
    runningDetail: "Finding trending repositories.",
    icon: TrendingUp,
  },
  getHotRepositories: {
    title: "Hot Repos",
    subtitle: "Discovering hot repositories",
    detail: "Finding the most active repositories",
    runningDetail: "Discovering hot repositories.",
    icon: Sparkles,
  },
  getTopContributors: {
    title: "Top Contributors",
    subtitle: "Fetching top contributors",
    detail: "Identifying leading developers",
    runningDetail: "Fetching top contributors.",
    icon: Users,
  },
  getDeveloperProfile: {
    title: "Developer Profile",
    subtitle: "Loading developer profile",
    detail: "Pulling developer activity and skills",
    runningDetail: "Loading developer profile data.",
    icon: Users,
  },
  getDeveloperByCountry: {
    title: "Country Distribution",
    subtitle: "Analyzing developer locations",
    detail: "Mapping developer geographic distribution",
    runningDetail: "Analyzing developer locations.",
    icon: Globe2,
  },
  getAnnualReport: {
    title: "Annual Report",
    subtitle: "Loading annual report data",
    detail: "Compiling yearly analytics summary",
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

function getQuestionText(input: unknown) {
  if (typeof input === "string" && input.trim().length > 0) {
    return input.trim();
  }

  if (!input || typeof input !== "object" || !("question" in input)) {
    return null;
  }

  const value = input.question;
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function getToolStatus(part: ToolPart): ToolStatusConfig {
  switch (part.state) {
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
  case "output-available":
  default:
    return {
      label: "Complete",
      detail: "Results added to the response.",
      tone: "success",
      Icon: CheckCircle2,
    };
  }
}

export function isToolLikePart(
  part: CopilotUIMessage["parts"][number],
): part is ToolPart {
  return isToolUIPart(part);
}

export function ToolPartCard({ part }: { part: ToolPart }) {
  const toolName = getToolName(part);
  const toolCopy = getToolCopy(toolName);
  const question = getQuestionText(part.input);
  const statusConfig = getToolStatus(part);
  const statusDetail =
    statusConfig.tone === "running"
      ? (toolCopy.runningDetail ?? statusConfig.detail)
      : (toolCopy.detail ?? statusConfig.detail);
  const ToolIcon = toolCopy.icon ?? Database;
  const StatusIcon = statusConfig.Icon;
  const badgeClass = cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
    statusConfig.tone === "success" &&
      "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200",
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
    <div className="mb-3 flex w-full items-start gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5 dark:border-border-dark/70 dark:bg-surface-dark/30">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-xs dark:border-border-dark/60 dark:bg-background-dark/80">
        <ToolIcon className="size-4 text-muted-foreground" />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 w-full">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground dark:text-foreground-dark">
              {toolCopy.title}
            </span>
            <span className="text-muted-foreground/70">&bull;</span>
            <span className="truncate text-sm text-muted-foreground">
              {toolCopy.subtitle}
            </span>
          </div>

          {question ? (
            <p className="truncate text-sm text-muted-foreground">{question}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{statusDetail}</p>
          )}
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
  );
}
