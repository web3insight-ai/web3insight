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

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  type ChainOfThoughtStepStatus,
} from "@/components/ai-elements/chain-of-thought";
import { Shimmer } from "@/components/ai-elements/shimmer";
import type { CopilotUIMessage } from "~/ai/copilot-types";

import { createStablePartKey } from "./create-stable-part-key";
import { isToolLikePart, normalizeToolPart } from "./normalize-tool-part";

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

function toneToStepStatus(tone: ToolTone): ChainOfThoughtStepStatus {
  if (tone === "completed") {
    return "complete";
  }
  if (tone === "muted") {
    return "pending";
  }
  return "active";
}

// Reason: A trace step is built from either a tool invocation or an
// interstitial assistant text part (reasoning written between tool calls).
export type ToolTracePart = CopilotUIMessage["parts"][number];

interface ToolTraceDisplayStep {
  icon?: LucideIcon;
  isWorking: boolean;
  keySeed: string;
  label: string;
  status: ChainOfThoughtStepStatus;
  textTone: "primary" | "secondary";
}

function getInputString(input: unknown, key: string): string | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const value = (input as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function truncateLabel(value: string, maxLength = 80): string {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

// Reason: Surface the actual question for a custom data query instead of the
// generic "Data Query" title, so the trace step is specific and trustworthy.
// queryWeb3Data is the only free-text tool; structured tools keep their title.
function getStepLabel(
  toolName: string,
  input: unknown,
  fallbackTitle: string,
): string {
  if (toolName === "queryWeb3Data") {
    const question = getInputString(input, "question");
    if (question) {
      return truncateLabel(question);
    }
  }

  return fallbackTitle;
}

function getToolTraceDisplaySteps(
  parts: ToolTracePart[],
): ToolTraceDisplayStep[] {
  return parts.flatMap((part, index): ToolTraceDisplayStep[] => {
    if (part.type === "text") {
      const text = part.text.trim();
      if (!text) {
        return [];
      }

      const isStreamingText = part.state === "streaming";
      return [
        {
          isWorking: isStreamingText,
          keySeed: `text:${index}:${text}`,
          label: text,
          status: isStreamingText ? "active" : "complete",
          textTone: "primary",
        },
      ];
    }

    if (!isToolLikePart(part)) {
      return [];
    }

    const normalized = normalizeToolPart(part);
    const toolCopy = getToolCopy(normalized.toolName);
    const tone = getToolStatus(normalized.state).tone;

    return [
      {
        icon: toolCopy.icon ?? DatabaseIcon,
        isWorking: tone === "running",
        keySeed: `${normalized.toolName}:${normalized.toolCallId || index}`,
        label: getStepLabel(
          normalized.toolName,
          normalized.input,
          toolCopy.title,
        ),
        status: toneToStepStatus(tone),
        textTone: "secondary",
      },
    ];
  });
}

// Reason: Collapsible "Reasoning" trace that replaces the flat stack of
// per-tool status cards. Auto-expands while a step is still working and
// shimmers the active step's label during streaming.
export function ToolPartGroupCard({
  isStreaming,
  parts,
}: {
  isStreaming: boolean;
  parts: ToolTracePart[];
}) {
  const displaySteps = getToolTraceDisplaySteps(parts);
  if (displaySteps.length === 0) {
    return null;
  }

  const stepCount = displaySteps.length;
  const defaultOpen = displaySteps.some((step) => step.status !== "complete");
  const seenStepKeys = new Map<string, number>();

  return (
    <ChainOfThought className="mb-4 w-full" defaultOpen={defaultOpen}>
      <ChainOfThoughtHeader>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-medium text-fg text-sm">
            Reasoning
          </span>
          <span className="text-rule">·</span>
          <span className="truncate text-fg-muted text-sm">
            {stepCount} step{stepCount === 1 ? "" : "s"}
          </span>
        </div>
      </ChainOfThoughtHeader>

      <ChainOfThoughtContent className="px-1 pt-1">
        {displaySteps.map((step, index) => {
          const stepKey = createStablePartKey(step.keySeed, seenStepKeys);
          const labelClassName =
            step.textTone === "primary"
              ? "text-fg text-sm leading-6"
              : "text-fg-muted text-sm leading-6";

          return (
            <ChainOfThoughtStep
              icon={step.icon}
              key={stepKey}
              label={
                step.isWorking && isStreaming ? (
                  <Shimmer as="span" className="text-sm leading-6">
                    {step.label}
                  </Shimmer>
                ) : (
                  <p className={labelClassName}>{step.label}</p>
                )
              }
              showConnector={index < displaySteps.length - 1}
              status={step.status}
            />
          );
        })}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
