import { Fragment, Suspense, useMemo } from "react";

import { SPEC_DATA_PART_TYPE } from "@json-render/core";
import { useJsonRenderMessage } from "@json-render/react";
import type { DataPart } from "@json-render/react";

import { MessageResponse } from "@/components/ai-elements/message";
import type { CopilotUIMessage } from "~/ai/copilot-types";

import { CopilotJsonRenderer } from "./copilot-json-renderer";
import { createStablePartKey } from "./create-stable-part-key";
import { isToolLikePart, normalizeToolPart } from "./normalize-tool-part";
import { ReasoningSection } from "./reasoning-section";
import { SourcesSection } from "./sources-section";
import { ToolPartGroupCard } from "./tool-part-card";
import { getToolResultRenderer } from "./tool-result-renderers";
import { ChartLoadingSkeleton } from "./tool-result-renderers/chart-loading-skeleton";

type MessagePart = CopilotUIMessage["parts"][number];

interface ToolTraceBlock {
  startIndex: number;
  partIndexes: Set<number>;
  parts: MessagePart[];
}

function isTraceTextPart(part: MessagePart): boolean {
  return part.type === "text" && part.text.trim().length > 0;
}

// Reason: web3insight messages carry no `step-start` markers, so the reasoning
// trace is derived from the span between the first and last tool call. Tool
// parts plus the interstitial (non-empty) text written between them form one
// collapsible trace; leading/trailing text stays a normal assistant response.
function getToolTraceBlock(
  parts: CopilotUIMessage["parts"],
): ToolTraceBlock | null {
  let firstTool = -1;
  let lastTool = -1;

  for (let index = 0; index < parts.length; index += 1) {
    if (isToolLikePart(parts[index])) {
      if (firstTool === -1) {
        firstTool = index;
      }
      lastTool = index;
    }
  }

  if (firstTool === -1) {
    return null;
  }

  const partIndexes = new Set<number>();
  const traceParts: MessagePart[] = [];

  for (let index = firstTool; index <= lastTool; index += 1) {
    const part = parts[index];
    if (isToolLikePart(part) || isTraceTextPart(part)) {
      partIndexes.add(index);
      traceParts.push(part);
    }
  }

  return { startIndex: firstTool, partIndexes, parts: traceParts };
}

interface CopilotMessagePartsProps {
  message: CopilotUIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
}

export function CopilotMessageParts({
  message,
  isLastMessage,
  isStreaming,
}: CopilotMessagePartsProps) {
  // Reason: useJsonRenderMessage scans message.parts for SPEC_DATA_PART_TYPE
  // entries and assembles them into a single Spec for the renderer.
  const { hasSpec, spec } = useJsonRenderMessage(message.parts as DataPart[]);

  const reasoningText = useMemo(() => {
    return message.parts
      .filter((part) => part.type === "reasoning")
      .map((part) => part.text)
      .join("\n\n")
      .trim();
  }, [message.parts]);

  const sourceParts = useMemo(() => {
    return message.parts.flatMap((part) => {
      if (part.type !== "source-url") {
        return [];
      }

      const partUrl = (part as { url?: unknown }).url;
      if (typeof partUrl !== "string") {
        return [];
      }

      return [{ url: partUrl }];
    });
  }, [message.parts]);

  const lastPart = message.parts[message.parts.length - 1];
  const isReasoningStreaming = Boolean(
    reasoningText &&
    isLastMessage &&
    isStreaming &&
    lastPart?.type === "reasoning",
  );
  const isTextStreaming = Boolean(
    isLastMessage && isStreaming && lastPart?.type === "text",
  );

  const toolTraceBlock = useMemo(
    () => getToolTraceBlock(message.parts),
    [message.parts],
  );

  // Reason: We use Maps to track duplicate keys for stable React keys.
  // These must be declared outside the .map() call so counts accumulate
  // correctly across iterations of the same render pass.
  const seenTextKeys = new Map<string, number>();
  const seenToolKeys = new Map<string, number>();
  const seenSpecKeys = new Map<string, number>();
  let hasRenderedSpec = false;

  return (
    <>
      <ReasoningSection
        isStreaming={isReasoningStreaming}
        reasoningText={reasoningText}
      />

      <SourcesSection messageId={message.id} sourceParts={sourceParts} />

      {message.parts.map((part, index) => {
        // Render the whole tool trace once, at the position of the first tool.
        const traceCard =
          toolTraceBlock?.startIndex === index ? (
            <ToolPartGroupCard
              isStreaming={isLastMessage && isStreaming}
              key={createStablePartKey(
                `${message.id}-tool-trace`,
                seenToolKeys,
              )}
              parts={toolTraceBlock.parts}
            />
          ) : null;

        // Parts consumed by the trace render as steps inside it. Tool parts
        // still surface their rich result visualization in the main flow, so
        // charts stay visible when the trace is collapsed.
        if (toolTraceBlock?.partIndexes.has(index)) {
          if (!isToolLikePart(part)) {
            return traceCard;
          }

          const normalized = normalizeToolPart(part);
          const isComplete = normalized.state === "output-available";
          const ResultRenderer = getToolResultRenderer(normalized.toolName);

          if (!(isComplete && ResultRenderer !== null)) {
            return traceCard;
          }

          return (
            <Fragment
              key={createStablePartKey(
                `${message.id}-tool-result-${normalized.toolName}-${normalized.toolCallId}`,
                seenToolKeys,
              )}
            >
              {traceCard}
              <div className="mb-3 max-w-[600px]">
                <Suspense fallback={<ChartLoadingSkeleton />}>
                  <ResultRenderer data={normalized.output} />
                </Suspense>
              </div>
            </Fragment>
          );
        }

        if (part.type === "text") {
          if (!part.text) {
            return null;
          }

          return (
            <MessageResponse
              isAnimating={
                isTextStreaming && index === message.parts.length - 1
              }
              key={createStablePartKey(`${message.id}-text`, seenTextKeys)}
            >
              {part.text}
            </MessageResponse>
          );
        }

        // Reason: Render the json-render spec once, on the first data-spec part.
        // Subsequent spec patches are already folded into `spec` by the hook.
        if (part.type === SPEC_DATA_PART_TYPE) {
          if (!hasSpec || hasRenderedSpec) {
            return null;
          }
          hasRenderedSpec = true;
          return (
            <CopilotJsonRenderer
              isStreaming={isLastMessage && isStreaming}
              key={createStablePartKey(`${message.id}-spec`, seenSpecKeys)}
              spec={spec}
            />
          );
        }

        return null;
      })}
    </>
  );
}
