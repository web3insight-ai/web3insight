import { useMemo } from "react";

import { MessageResponse } from "@/components/ai-elements/message";
import type { CopilotUIMessage } from "~/ai/copilot-types";

import { createStablePartKey } from "./create-stable-part-key";
import { ReasoningSection } from "./reasoning-section";
import { SourcesSection } from "./sources-section";
import { isToolLikePart, ToolPartCard } from "./tool-part-card";

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
          return (
            <ToolPartCard
              key={createStablePartKey(
                `${message.id}-tool-${part.type}-${String(part.toolCallId ?? "")}-${part.state}`,
                seenToolKeys,
              )}
              part={part}
            />
          );
        }

        return null;
      })}
    </>
  );
}
