import { getToolName, isToolUIPart } from "ai";
import type { CopilotUIMessage } from "~/ai/copilot-types";

// Reason: The DB may contain parts in the old format (type: "tool-invocation"
// with toolInvocation: {toolName, state, result}) from before the AI SDK v6
// migration. This helper normalizes both formats into a consistent shape
// that the tool card and renderer components can use.

export interface NormalizedToolPart {
  toolName: string;
  toolCallId: string;
  input: unknown;
  state: string;
  output: unknown;
}

// Reason: Legacy persisted parts use {type: "tool-invocation", toolInvocation: {...}}
interface LegacyToolInvocation {
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  state?: string;
  result?: unknown;
}

interface PartWithLegacyFields {
  type: string;
  toolCallId?: string;
  toolInvocation?: LegacyToolInvocation;
  state?: string;
  input?: unknown;
  output?: unknown;
}

/**
 * Check if a message part is a tool part (either new or legacy format).
 */
export function isToolLikePart(
  part: CopilotUIMessage["parts"][number],
): boolean {
  // New AI SDK v6 format: type starts with "tool-" (e.g. "tool-getPlatformOverview")
  if (isToolUIPart(part)) return true;

  // Legacy DB format: type is exactly "tool-invocation" with toolInvocation object
  const legacy = part as PartWithLegacyFields;
  if (
    legacy.type === "tool-invocation" &&
    legacy.toolInvocation &&
    typeof legacy.toolInvocation === "object"
  ) {
    return true;
  }

  return false;
}

/**
 * Normalize a tool part into a consistent shape regardless of format.
 */
export function normalizeToolPart(
  part: CopilotUIMessage["parts"][number],
): NormalizedToolPart {
  const p = part as PartWithLegacyFields;

  // New AI SDK v6 format: type="tool-<NAME>", state, output
  if (p.type !== "tool-invocation" && p.type.startsWith("tool-")) {
    return {
      toolName: getToolName(part as Parameters<typeof getToolName>[0]),
      toolCallId: p.toolCallId ?? "",
      input: p.input,
      state: (p.state as string) ?? "input-available",
      output: p.output,
    };
  }

  // Legacy DB format: type="tool-invocation", toolInvocation: { toolName, state, result }
  const inv = p.toolInvocation;
  if (inv && typeof inv === "object") {
    // Reason: Map legacy state values to AI SDK v6 equivalents
    let normalizedState = "input-available";
    if (inv.state === "result") normalizedState = "output-available";
    else if (inv.state === "call") normalizedState = "input-available";

    return {
      toolName: inv.toolName ?? "unknown",
      toolCallId: inv.toolCallId ?? p.toolCallId ?? "",
      input: inv.args,
      state: normalizedState,
      output: inv.result,
    };
  }

  return {
    toolName: "unknown",
    toolCallId: p.toolCallId ?? "",
    input: undefined,
    state: "input-available",
    output: undefined,
  };
}
