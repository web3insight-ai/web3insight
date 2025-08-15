import { Link as NextUILink, Input, Skeleton, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAtom } from "jotai";

import { getMetadata } from "@/utils/app";

import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";

import { fetchStatisticsOverview, fetchStatisticsRank } from "~/statistics/repository";
import EcosystemRankViewWidget from "~/ecosystem/views/ecosystem-rank";
import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";

import Section from "../../components/section";
import MetricOverview from "./MetricOverview";
import { fetchAnalyzedStatistics } from "~/ai/repository";
import Markdown from "react-markdown";

const { title, tagline, description } = getMetadata();

export const meta: MetaFunction = () => {
  const pageTitle = `${title} - ${tagline}`;

  return [
    { title: pageTitle },
    {
      property: "og:title",
      content: pageTitle,
    },
    {
      name: "description",
      content: description,
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // If this is a GitHub OAuth callback, redirect to the proper handler
  if (code || error) {
    const callbackUrl = new URL("/connect/github/redirect", request.url);
    if (code) callbackUrl.searchParams.set("code", code);
    if (error) {
      callbackUrl.searchParams.set("error", error);
      const errorDescription = url.searchParams.get("error_description");
      if (errorDescription) callbackUrl.searchParams.set("error_description", errorDescription);
    }
    return redirect(callbackUrl.toString());
  }
  try {
    const statisticsResult = await fetchStatisticsOverview();
    const rankResult = await fetchStatisticsRank();

    // Use fallback data if statistics fetch failed
    const statisticOverview = statisticsResult.success ? statisticsResult.data : {
      ecosystem: 0,
      repository: 0,
      developer: 0,
      coreDeveloper: 0,
    };

    // Use fallback data if rank fetch failed
    const statisticRank = rankResult.success ? rankResult.data : {
      ecosystem: [],
      repository: [],
      developer: [],
    };

    // Log any failures for debugging
    if (!statisticsResult.success) {
      console.warn("Statistics overview fetch failed:", statisticsResult.message);
    }
    if (!rankResult.success) {
      console.warn("Statistics rank fetch failed:", rankResult.message);
    }

    return json({ statisticOverview, statisticRank });
  } catch (error) {
    // Extra safety net - if something else goes wrong, provide fallback data
    console.error("Loader error in home route:", error);

    return json({
      statisticOverview: {
        ecosystem: 0,
        repository: 0,
        developer: 0,
        coreDeveloper: 0,
      },
      statisticRank: {
        ecosystem: [],
        repository: [],
        developer: [],
      },
    });
  }
};

export const action = async (ctx: ActionFunctionArgs) => {
  // const user = await getUser(ctx.request);
  // const formData = await ctx.request.formData();

  // const res = await insertOne({
  //   user,
  //   ipAddress: getClientIPAddress(ctx.request.headers),
  //   query: formData.get("query") as string,
  // });

  // return res.success && res.data ?
  //   redirect(`/query/${res.data.documentId}`) :
  //   json({
  //     type: res.extra?.type,
  //     error: res.message,
  //   }, { status: Number(res.code) });

  const formData = await ctx.request.formData();
  const res = await fetchAnalyzedStatistics({
    query: formData.get("query") as string,
  });
  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

export default function Index() {
  const { statisticOverview, statisticRank } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const asking = fetcher.state === "submitting";
  const errorMessage = fetcher.data?.error || null;
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (fetcher.state === "idle" && errorMessage) {
      // Open the sign-in modal when unauthorized
      setAuthModalType("signin");
      setAuthModalOpen(true);
    }
  }, [fetcher.state, errorMessage, setAuthModalOpen, setAuthModalType]);

  // Function to handle signup click
  // const handleSignupClick = () => {
  //   setAuthModalType("signup");
  //   setAuthModalOpen(true);
  // };

  // Check if user is at the bottom of the scrollable area
  const isAtBottom = (element: HTMLElement) => {
    const threshold = 50; // pixels from bottom
    return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
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
          behavior: 'smooth',
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
    const controller = new AbortController();

    fetch("/api/ai/query", {
      method: "POST",
      body: new URLSearchParams({ query: input }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/event-stream",
      },
      signal: controller.signal,
    }).then(async (res) => {
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      if (!reader) return;

      // eslint-disable-next-line no-constant-condition
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
          } catch (e) {
            // Ignore JSON parsing errors during streaming
          }
        }

        buffer = lines[lines.length - 1];
      }
    }).catch(() => {
      setIsStreaming(false);
    });

    return () => controller.abort();
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    // Use setTimeout to ensure input is set before submitting
    setTimeout(() => {
      if (formRef.current) {
        const submitButton = formRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitButton?.click();
      }
    }, 0);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="w-full max-w-content mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Sparkles size={14} />
              <span>AI-Powered Insights</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ask Anything About Web3</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Get instant insights about ecosystems, developers, repositories, and more
            </p>
          </div>

          <div className="relative max-w-xl mx-auto">
            {/* Gradient background effect */}
            <div className="absolute inset-0 bg-gradient-radial opacity-30 blur-2xl" />

            <div className="relative">
              <fetcher.Form ref={formRef} method="POST" action="?index">
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
                      inputWrapper: "h-12 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark hover:border-primary focus-within:border-primary transition-colors shadow-sm",
                    }}
                    startContent={<Search size={18} className="text-gray-400" />}
                  />
                  <button
                    type="submit"
                    disabled={asking || !input.trim()}
                    onClick={onClickHandle}
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
                  <p className="text-xs text-danger mt-2 text-center animate-fade-in">{errorMessage}</p>
                )}
              </fetcher.Form>

              {/* Example queries */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  "top ecosystems of web3",
                  "how many core devs of ethereum",
                  "top contributor of solana",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-surface-elevated hover:bg-gray-200 dark:hover:bg-surface-dark rounded-md transition-colors duration-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <MetricOverview dataSource={statisticOverview} />
      </div>

      <div className="w-full max-w-content mx-auto px-6 pb-12">
        <Section
          className="mt-12"
          title="Web3 Ecosystem Analytics"
          summary="Comprehensive insights about major blockchain ecosystems"
        >
          <EcosystemRankViewWidget dataSource={statisticRank.ecosystem} />
        </Section>
        <Section
          className="mt-16"
          title="Repository Activity"
          summary="Top repositories by developer engagement and contributions"
        >
          <RepositoryRankViewWidget dataSource={statisticRank.repository} />
        </Section>
        <Section
          className="mt-16"
          title="Top Developer Activity"
          summary="Leading contributors across Web3 ecosystems"
        >
          <DeveloperRankViewWidget dataSource={statisticRank.developer} view="grid" />
        </Section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border dark:border-border-dark">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Supported by{" "}
              <NextUILink href="https://openbuild.xyz/" className="text-foreground dark:text-foreground font-medium hover:text-primary transition-colors">
                OpenBuild
              </NextUILink>{" "}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">© {new Date().getFullYear()} {title}. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Answer Display Modal */}
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
          closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        }}
      >
        <ModalContent>
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
                      <div className={isStreaming ? "typewriter-cursor" : ""}>
                        <Markdown
                          components={{
                            h1: ({ children }) => <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">{children}</h3>,
                            p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 text-primary px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">{children}</pre>,
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
    </div>
  );
}
