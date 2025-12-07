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
import { useEffect, useState, useRef } from "react";
import Markdown from "react-markdown";
import { usePrivy } from "@privy-io/react-auth";
import { motion, AnimatePresence } from "framer-motion";
import { MetricOverview } from "$/index";
import { fadeInUp, fadeInDown, modalTransition } from "@/utils/animations";

export default function HomePageClient() {
  const { ready, authenticated, login } = usePrivy();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const [statisticOverview, setStatisticOverview] = useState({
    ecosystem: 0,
    repository: 0,
    developer: 0,
    coreDeveloper: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load statistics overview on client side
  useEffect(() => {
    fetch("/api/statistics/overview")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setStatisticOverview({
            ecosystem: Number(result.data.ecosystem),
            repository: Number(result.data.repository),
            developer: Number(result.data.developer),
            coreDeveloper: Number(result.data.coreDeveloper),
          });
        }
      })
      .catch((error) => {
        console.error("Failed to load statistics overview:", error);
      })
      .finally(() => {
        setIsLoadingStats(false);
      });
  }, []);

  useEffect(() => {
    if (!asking && errorMessage && ready && !authenticated) {
      // Open Privy login when unauthorized
      login();
    }
  }, [asking, errorMessage, ready, authenticated, login]);

  // Check if user is at the bottom of the scrollable area
  const isAtBottom = (element: HTMLElement) => {
    const threshold = 50; // pixels from bottom
    return (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      threshold
    );
  };

  // Smart auto-scroll function
  const autoScroll = () => {
    if (!modalBodyRef.current || userHasScrolled) return;

    const modalBody = modalBodyRef.current;
    const shouldScroll = isAtBottom(modalBody);

    if (shouldScroll) {
      // Clear any pending scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        modalBody.scrollTo({
          top: modalBody.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };

  // Handle scroll events to detect user interaction
  const handleScroll = () => {
    if (!modalBodyRef.current) return;

    const isNearBottom = isAtBottom(modalBodyRef.current);

    // User has scrolled up if not at bottom
    if (!isNearBottom && isStreaming) {
      setUserHasScrolled(true);
    } else if (isNearBottom) {
      setUserHasScrolled(false);
    }
  };

  const onClickHandle = () => {
    setOutput("");
    setIsStreaming(true);
    setIsModalOpen(true);
    setUserHasScrolled(false);
    setAsking(true);
    setErrorMessage(null);
    const controller = new AbortController();

    fetch("/api/ai/query", {
      method: "POST",
      body: new URLSearchParams({ query: input }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/event-stream",
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        setAsking(false);

        if (!res.ok) {
          setErrorMessage("Authentication required");
          setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        if (!reader) return;

        while (true) {
          const { value, done } = await reader!.read();
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
              // Use our smart auto-scroll
              autoScroll();
            } catch (_e) {
              // Ignore JSON parsing errors during streaming
            }
          }

          buffer = lines[lines.length - 1];
        }
      })
      .catch(() => {
        setIsStreaming(false);
        setAsking(false);
      });

    return () => controller.abort();
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    // Use setTimeout to ensure input is set before submitting
    setTimeout(() => {
      if (formRef.current) {
        const submitButton = formRef.current.querySelector(
          'button[type="submit"]',
        ) as HTMLButtonElement;
        submitButton?.click();
      }
    }, 0);
  };

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
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                onClickHandle();
              }}
            >
              <div className="relative">
                <Input
                  name="query"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
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
                  disabled={asking || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {asking ? (
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
