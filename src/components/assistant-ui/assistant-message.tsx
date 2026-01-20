"use client";

import {
  MessagePrimitive,
  type ToolCallMessagePartProps,
} from "@assistant-ui/react";
import ReactMarkdown from "react-markdown";
import type { FC, ReactNode } from "react";

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-3">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
      {children}
    </p>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </strong>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc ml-4 mb-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal ml-4 mb-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="bg-gray-100 dark:bg-gray-800 text-primary px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto mb-3 text-xs">
      {children}
    </pre>
  ),
};

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
            Text: ({ text }) => (
              <ReactMarkdown components={markdownComponents}>
                {text}
              </ReactMarkdown>
            ),
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
