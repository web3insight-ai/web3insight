"use client";

import {
  ThreadPrimitive,
  useThreadRuntime,
  useThread,
} from "@assistant-ui/react";
import {
  Sparkles,
  X,
  StopCircle,
  Minimize2,
  MessageSquarePlus,
} from "lucide-react";
import type { FC } from "react";
import { AssistantMessage } from "./assistant-message";
import { UserMessage } from "./user-message";
import { Composer } from "./composer";

// Grouped by category with rotation for variety
const QUERY_CATEGORIES = {
  overview: [
    "give me an overview of web3 development",
    "what's the total developer count in web3",
  ],
  ecosystems: [
    "top ecosystems of web3",
    "compare ethereum and solana ecosystems",
    "which ecosystem has the most core developers",
  ],
  trending: [
    "trending repos this week",
    "hottest repos by developer activity",
    "which repos gained most stars in 7 days",
  ],
  developers: [
    "top contributors of ethereum",
    "tell me about developer vitalik",
    "developer distribution by country",
  ],
  profiles: [
    "analyze pseudoyu's web3 contributions",
    "what ecosystems does gakonst contribute to",
  ],
  reports: ["show me the yearly web3 report", "what projects accept donations"],
};

// Get diverse examples (one from different categories)
const getExampleQueries = () => {
  const categories = Object.values(QUERY_CATEGORIES);
  const selected: string[] = [];
  const usedCats = new Set<number>();

  while (selected.length < 4 && usedCats.size < categories.length) {
    const catIdx = Math.floor(Math.random() * categories.length);
    if (!usedCats.has(catIdx)) {
      usedCats.add(catIdx);
      const cat = categories[catIdx];
      selected.push(cat[Math.floor(Math.random() * cat.length)]);
    }
  }
  return selected;
};

const EXAMPLE_QUERIES = getExampleQueries();

interface ThreadProps {
  onMinimize: () => void;
  onClose: () => void;
}

const Thread: FC<ThreadProps> = ({ onMinimize, onClose }) => {
  const runtime = useThreadRuntime();
  const threadState = useThread();
  const isRunning = threadState.isRunning;
  const hasMessages = threadState.messages.length > 0;

  const handleNewChat = () => {
    runtime.reset();
  };

  const handleStop = () => {
    runtime.cancelRun();
  };

  const handleSuggestionClick = (suggestion: string) => {
    runtime.append({
      role: "user",
      content: [{ type: "text", text: suggestion }],
    });
  };

  return (
    <ThreadPrimitive.Root className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-surface-elevated">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10">
            <Sparkles size={16} className="text-primary" />
          </div>
          <span className="font-semibold text-sm">Web3Insight AI</span>
        </div>
        <div className="flex items-center gap-1">
          {hasMessages && (
            <button
              type="button"
              onClick={handleNewChat}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="New chat"
            >
              <MessageSquarePlus size={16} />
            </button>
          )}
          {isRunning && (
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
            >
              <StopCircle size={12} />
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={onMinimize}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto min-h-[280px] max-h-[calc(80vh-120px)]">
        <ThreadPrimitive.Empty>
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ask anything about Web3 ecosystems, developers, or repositories.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                Try asking:
              </p>
              {EXAMPLE_QUERIES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleSuggestionClick(example)}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-surface-elevated hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>

        <div className="p-4">
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage,
            }}
          />
        </div>
      </ThreadPrimitive.Viewport>

      {/* Composer */}
      <div className="border-t border-gray-200 dark:border-border-dark p-3">
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  );
};

export { Thread };
