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
import { ToolPartCard } from "./tool-part-card";
import { getToolResultRenderer } from "./tool-result-renderers";
import { ChartLoadingSkeleton } from "./tool-result-renderers/chart-loading-skeleton";

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

        if (isToolLikePart(part)) {
          const normalized = normalizeToolPart(part);
          const stableKey = createStablePartKey(
            `${message.id}-tool-${normalized.toolName}-${normalized.toolCallId}-${normalized.state}`,
            seenToolKeys,
          );

          const isComplete = normalized.state === "output-available";
          const ResultRenderer = getToolResultRenderer(normalized.toolName);
          const hasRichResult = isComplete && ResultRenderer !== null;

          // Reason: UX flow:
          // - Running/pending → show compact loading card
          // - Error/denied → show card with error badge
          // - Complete → always show completed card (collapsed)
          // - Complete + has renderer → also show the inline visualization
          return (
            <Fragment key={stableKey}>
              <ToolPartCard normalized={normalized} />
              {hasRichResult && (
                <div className="mb-3 max-w-[600px]">
                  <Suspense fallback={<ChartLoadingSkeleton />}>
                    <ResultRenderer data={normalized.output} />
                  </Suspense>
                </div>
              )}
            </Fragment>
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
              key={createStablePartKey(`${message.id}-spec`, seenSpecKeys)}
              spec={spec}
              isStreaming={isLastMessage && isStreaming}
            />
          );
        }

        return null;
      })}
    </>
  );
}
