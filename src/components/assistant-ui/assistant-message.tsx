"use client";

import {
  MessagePrimitive,
  type ToolCallMessagePartProps,
} from "@assistant-ui/react";
import type { FC } from "react";
import { MarkdownText } from "./markdown-text";

// Only show a minimal loading indicator while tool is running, hide result
const ToolFallback: FC<ToolCallMessagePartProps> = ({ toolName, result }) => {
  const hasResult = result !== undefined && result !== null;

  // Hide completely once we have a result - the AI will summarize it in text
  if (hasResult) {
    return null;
  }

  // Show loading indicator while tool is executing
  return (
    <div className="flex items-center gap-2 text-xs text-fg-muted my-2 font-mono">
      <span
        aria-hidden
        className="animate-cursor inline-block h-[0.9em] w-[0.55ch] translate-y-[2px] bg-accent align-middle"
      />
      <span>
        Fetching{" "}
        {toolName
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()
          .trim()}
        ...
      </span>
    </div>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex justify-start mb-4">
      <div className="max-w-[95%]">
        <MessagePrimitive.Content
          components={{
            Text: MarkdownText,
            tools: {
              Fallback: ToolFallback,
            },
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
};

export { AssistantMessage };
