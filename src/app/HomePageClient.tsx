"use client";

import {
  Input,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import Markdown from "react-markdown";
import { usePrivy } from "@privy-io/react-auth";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MetricOverview } from "$/index";
import { fadeInUp, fadeInDown, modalTransition } from "@/utils/animations";
import { useOverviewStatistics } from "@/hooks/api";
import { aiQuerySchema, type AIQueryInput } from "@/lib/form/schemas";

export default function HomePageClient() {
  const { ready, authenticated, login } = usePrivy();

  // Form state using React Hook Form + Zod
  const form = useForm<AIQueryInput>({
    resolver: zodResolver(aiQuerySchema),
    defaultValues: {
      query: "",
    },
    mode: "onChange",
  });

  // UI state
  const [output, setOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch statistics using TanStack Query
  const { data: statisticsData, isLoading: isLoadingStats } =
    useOverviewStatistics();

  const statisticOverview = {
    ecosystem: statisticsData?.totalEcosystems ?? 0,
    repository: statisticsData?.totalRepositories ?? 0,
    developer: statisticsData?.totalDevelopers ?? 0,
    coreDeveloper: statisticsData?.totalCoreDevelopers ?? 0,
  };

  // AI Query mutation
  const aiQueryMutation = useMutation({
    mutationFn: async (data: AIQueryInput) => {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        body: new URLSearchParams({ query: data.query }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "text/event-stream",
        },
      });
      return response;
    },
    onMutate: () => {
      setOutput("");
      setIsStreaming(true);
      setIsModalOpen(true);
      setUserHasScrolled(false);
      setErrorMessage(null);
    },
    onSuccess: async (response) => {
      if (!response.ok) {
        setErrorMessage("Authentication required");
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          for (let line of lines) {
            line = line.trim();
            if (!line.startsWith("data:")) continue;

            const jsonStr = line.replace(/^data:\s*/, "");
            if (jsonStr === "[DONE]") {
              setIsStreaming(false);
              return;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const piece = parsed?.data?.answer || "";
              setOutput((prev) => prev + piece);
              autoScroll();
            } catch {
              // Ignore JSON parsing errors during streaming
            }
          }

          buffer = lines[lines.length - 1];
        }
      } finally {
        setIsStreaming(false);
      }
    },
    onError: () => {
      setIsStreaming(false);
    },
  });

  // Handle auth prompt when unauthorized
  useEffect(() => {
    if (!aiQueryMutation.isPending && errorMessage && ready && !authenticated) {
      login();
    }
  }, [aiQueryMutation.isPending, errorMessage, ready, authenticated, login]);

  // Check if user is at the bottom of the scrollable area
  const isAtBottom = useCallback((element: HTMLElement) => {
    const threshold = 50;
    return (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      threshold
    );
  }, []);

  // Smart auto-scroll function
  const autoScroll = useCallback(() => {
    if (!modalBodyRef.current || userHasScrolled) return;

    const modalBody = modalBodyRef.current;
    const shouldScroll = isAtBottom(modalBody);

    if (shouldScroll) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      requestAnimationFrame(() => {
        modalBody.scrollTo({
          top: modalBody.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [userHasScrolled, isAtBottom]);

  // Handle scroll events to detect user interaction
  const handleScroll = useCallback(() => {
    if (!modalBodyRef.current) return;

    const isNearBottom = isAtBottom(modalBodyRef.current);

    if (!isNearBottom && isStreaming) {
      setUserHasScrolled(true);
    } else if (isNearBottom) {
      setUserHasScrolled(false);
    }
  }, [isAtBottom, isStreaming]);

  // Form submit handler
  const onSubmit = form.handleSubmit((data) => {
    aiQueryMutation.mutate(data);
  });

  const handleExampleClick = (example: string) => {
    form.setValue("query", example, { shouldValidate: true });
    setTimeout(() => {
      if (formRef.current) {
        const submitButton = formRef.current.querySelector(
          'button[type="submit"]',
        ) as HTMLButtonElement;
        submitButton?.click();
      }
    }, 0);
  };

  const isSubmitting = aiQueryMutation.isPending;
  const queryValue = form.watch("query");

  return (
    <>
      {/* Search Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <motion.div
            variants={fadeInDown}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3"
          >
            <Sparkles size={14} />
            <span>AI-Powered Insights</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold mb-2"
          >
            Ask Anything About Web3
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
          >
            Get instant insights about ecosystems, developers, repositories, and
            more
          </motion.p>
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="relative max-w-xl mx-auto"
        >
          {/* Gradient background effect */}
          <div className="absolute inset-0 bg-gradient-radial opacity-30 blur-2xl" />

          <div className="relative">
            <form ref={formRef} onSubmit={onSubmit}>
              <div className="relative">
                <Input
                  {...form.register("query")}
                  value={queryValue}
                  onChange={(e) => form.setValue("query", e.target.value)}
                  fullWidth
                  size="md"
                  placeholder="Ask about ecosystems, developers, or repositories..."
                  classNames={{
                    input: "h-12 text-sm font-normal pr-12",
                    inputWrapper:
                      "h-12 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark hover:border-primary focus-within:border-primary transition-colors shadow-sm",
                  }}
                  startContent={<Search size={18} className="text-gray-400" />}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !queryValue?.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>
              {errorMessage && (
                <p className="text-xs text-danger mt-2 text-center animate-fade-in">
                  {errorMessage}
                </p>
              )}
              {form.formState.errors.query && (
                <p className="text-xs text-danger mt-2 text-center animate-fade-in">
                  {form.formState.errors.query.message}
                </p>
              )}
            </form>

            {/* Example queries */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                "top ecosystems of web3",
                "how many core devs of ethereum",
                "top contributor of solana",
              ].map((example, index) => (
                <motion.button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-surface-elevated hover:bg-gray-200 dark:hover:bg-surface-dark rounded-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <MetricOverview
        dataSource={statisticOverview}
        isLoading={isLoadingStats}
      />

      {/* Answer Display Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setIsStreaming(false);
            }}
            size="3xl"
            scrollBehavior="inside"
            classNames={{
              base: "max-h-[90vh]",
              wrapper: "overflow-visible",
              backdrop: "bg-background-dark/50",
              header: "border-b border-gray-200 dark:border-gray-800",
              body: "p-0",
              closeButton:
                "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            }}
          >
            <ModalContent
              as={motion.div}
              variants={modalTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ModalHeader className="flex items-center gap-2 px-6 py-4">
                <Sparkles size={20} className="text-primary" />
                <span className="text-lg font-semibold">Web3Insights</span>
              </ModalHeader>
              <ModalBody className="p-0">
                <div
                  className="overflow-y-auto max-h-[calc(90vh-80px)]"
                  ref={modalBodyRef}
                  onScroll={handleScroll}
                >
                  <div className="answer-card-bg dark:answer-card-bg-dark relative rounded-b-lg">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 answer-card-pattern opacity-50" />

                    <div className="p-8 relative z-10">
                      {isStreaming && output.length === 0 && (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-3/4 rounded-lg" />
                          <Skeleton className="h-4 w-full rounded-lg" />
                          <Skeleton className="h-4 w-5/6 rounded-lg" />
                        </div>
                      )}
                      {output.length > 0 && (
                        <div className="prose-enhanced animate-fade-in">
                          <div
                            className={isStreaming ? "typewriter-cursor" : ""}
                          >
                            <Markdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-900 dark:text-gray-100">
                                    {children}
                                  </strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal ml-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="leading-relaxed">
                                    {children}
                                  </li>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-gray-100 dark:bg-gray-800 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                                    {children}
                                  </pre>
                                ),
                              }}
                            >
                              {output}
                            </Markdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
