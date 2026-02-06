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
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 my-2">
      <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
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
