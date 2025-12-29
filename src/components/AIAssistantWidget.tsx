"use client";

import { useAtom } from "jotai";
import { useState, useRef, useCallback, useEffect } from "react";
import { Input, Skeleton } from "@nextui-org/react";
import { Sparkles, X, Send, StopCircle, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { usePrivy } from "@privy-io/react-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Streamdown } from "streamdown";
import { aiWidgetOpenAtom } from "#/atoms";
import { aiQuerySchema, type AIQueryInput } from "@/lib/form/schemas";

const EXAMPLE_QUERIES = [
  "top ecosystems of web3",
  "how many core devs of ethereum",
  "top contributor of solana",
];

// Animation variants
const widgetTransition = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const buttonTransition = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.15 },
  },
};

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useAtom(aiWidgetOpenAtom);
  const { ready, authenticated, login } = usePrivy();

  // Form state
  const form = useForm<AIQueryInput>({
    resolver: zodResolver(aiQuerySchema),
    defaultValues: { query: "" },
    mode: "onChange",
  });

  // AI completion hook
  const {
    completion,
    complete,
    isLoading,
    stop,
    error: completionError,
    setCompletion,
  } = useCompletion({
    api: "/api/ai/query",
    streamProtocol: "text",
    onFinish: () => {
      setUserHasScrolled(false);
    },
    onError: (err: Error) => {
      console.error("AI completion error:", err);
      setErrorMessage("Failed to get AI response. Please try again.");
    },
  });

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auth prompt
  useEffect(() => {
    if (!isLoading && errorMessage && ready && !authenticated) {
      login();
    }
  }, [isLoading, errorMessage, ready, authenticated, login]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Check if at bottom of scroll area
  const isAtBottom = useCallback((element: HTMLElement) => {
    const threshold = 50;
    return (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      threshold
    );
  }, []);

  // Smart auto-scroll
  const autoScroll = useCallback(() => {
    if (!bodyRef.current || userHasScrolled) return;

    const body = bodyRef.current;
    const shouldScroll = isAtBottom(body);

    if (shouldScroll) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      requestAnimationFrame(() => {
        body.scrollTo({
          top: body.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [userHasScrolled, isAtBottom]);

  // Auto-scroll on completion update
  useEffect(() => {
    if (completion && isLoading) {
      autoScroll();
    }
  }, [completion, isLoading, autoScroll]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!bodyRef.current) return;

    const isNearBottom = isAtBottom(bodyRef.current);

    if (!isNearBottom && isLoading) {
      setUserHasScrolled(true);
    } else if (isNearBottom) {
      setUserHasScrolled(false);
    }
  }, [isAtBottom, isLoading]);

  // Form submit
  const onSubmit = form.handleSubmit(async (data) => {
    setErrorMessage(null);
    setUserHasScrolled(false);
    setHasSubmitted(true);
    await complete(data.query);
  });

  // Handle example click
  const handleExampleClick = (example: string) => {
    form.setValue("query", example, { shouldValidate: true });
    setTimeout(() => {
      onSubmit();
    }, 0);
  };

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    if (isLoading) {
      stop();
    }
  };

  // Handle minimize (keep state)
  const handleMinimize = () => {
    setIsOpen(false);
  };

  // Reset chat
  const handleNewChat = () => {
    setCompletion("");
    setHasSubmitted(false);
    form.reset();
    setErrorMessage(null);
  };

  const queryValue = form.watch("query");

  return (
    <>
      {/* Collapsed Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            variants={buttonTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
            aria-label="Open AI Assistant"
          >
            <Sparkles
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={widgetTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-50 w-96 max-h-[70vh] flex flex-col bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-surface-elevated">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <span className="font-semibold text-sm">Web3Insights AI</span>
              </div>
              <div className="flex items-center gap-1">
                {hasSubmitted && (
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-xs"
                  >
                    New
                  </button>
                )}
                {isLoading && (
                  <button
                    type="button"
                    onClick={stop}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                  >
                    <StopCircle size={12} />
                    Stop
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  aria-label="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div
              ref={bodyRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto min-h-[200px] max-h-[calc(70vh-120px)]"
            >
              {!hasSubmitted ? (
                // Welcome state
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Ask anything about Web3 ecosystems, developers, or
                    repositories.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      Try asking:
                    </p>
                    {EXAMPLE_QUERIES.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-surface-elevated hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Response state
                <div className="p-4">
                  {isLoading && completion.length === 0 && (
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-3/4 rounded-lg" />
                      <Skeleton className="h-3 w-full rounded-lg" />
                      <Skeleton className="h-3 w-5/6 rounded-lg" />
                    </div>
                  )}
                  {completion.length > 0 && (
                    <div className={isLoading ? "typewriter-cursor" : ""}>
                      <Streamdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-3">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc ml-4 mb-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal ml-4 mb-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 dark:bg-gray-800 text-primary px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto mb-3 text-xs">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {completion}
                      </Streamdown>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Input */}
            <div className="border-t border-gray-200 dark:border-border-dark p-3">
              <form onSubmit={onSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={queryValue}
                  onChange={(e) => form.setValue("query", e.target.value)}
                  placeholder="Ask a question..."
                  size="sm"
                  classNames={{
                    input: "text-sm",
                    inputWrapper:
                      "bg-gray-100 dark:bg-surface-elevated border-0 hover:bg-gray-200 dark:hover:bg-gray-700",
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !queryValue?.trim()}
                  className="w-9 h-9 flex-shrink-0 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
              {errorMessage && (
                <p className="text-xs text-danger mt-2">{errorMessage}</p>
              )}
              {completionError && (
                <p className="text-xs text-danger mt-2">
                  {completionError.message}
                </p>
              )}
              {form.formState.errors.query && (
                <p className="text-xs text-danger mt-2">
                  {form.formState.errors.query.message}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
