import { Card, CardBody, Link as NextUILink, Input } from "@nextui-org/react";
import {
  json,
  // redirect,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { ArrowRight, Search } from "lucide-react";
// import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";

import { getMetadata } from "@/utils/app";

import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";

import { ErrorType } from "~/query/helper";
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

export const loader = async () => {
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
  const errorType = fetcher.data?.type || null;
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    if (fetcher.state === "idle" && errorMessage) {
      if (errorType === ErrorType.SigninNeeded) {
        // Open the sign-in modal when unauthorized
        setAuthModalType("signin");
        setAuthModalOpen(true);
      }
    }
  }, [fetcher.state, errorMessage, errorType, setAuthModalOpen, setAuthModalType]);

  // Function to handle signup click
  // const handleSignupClick = () => {
  //   setAuthModalType("signup");
  //   setAuthModalOpen(true);
  // };

  const onClickHandle = () => {
    setOutput("");
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
          if (jsonStr === "[DONE]") return;

          try {
            const parsed = JSON.parse(jsonStr);
            const piece = parsed?.data?.answer || "";
            setOutput((prev) => prev + piece);
          } catch (e) {
            console.log(e);
          }
        }

        buffer = lines[lines.length - 1];
      }
    });

    return () => controller.abort();
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="w-full max-w-content mx-auto px-6 pt-8 pb-4">
        <MetricOverview dataSource={statisticOverview} />
      </div>

      <div className="w-full max-w-content mx-auto px-6 pb-16">

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

        <div className="mt-12">
          {/* Search Section */}
          <div className="w-full max-w-2xl mx-auto">
            <fetcher.Form method="POST" action="?index">
              <div className="relative">
                <Input
                  name="query"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
                  fullWidth
                  size="lg"
                  placeholder="Ask anything about ecosystem, community..."
                  classNames={{
                    input: "h-14 text-base font-normal",
                    inputWrapper: "h-14 shadow-subtle bg-white dark:bg-surface-dark pr-14 border border-border dark:border-border-dark hover:shadow-card transition-shadow",
                  }}
                  startContent={<Search size={20} className="text-gray-400" />}
                />
                <button
                  type="submit"
                  disabled={asking}
                  onClick={onClickHandle}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  {asking ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </div>
              {errorMessage && (
                <p className="text-sm text-danger mt-2 text-center">{errorMessage}</p>
              )}
            </fetcher.Form>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4 text-center">
              Try queries like &quot;top ecosystems of web3&quot;, &quot;how many core devs of ethereum&quot;, or &quot;top contributor of solana&quot;
            </p>
          </div>
          {output.length > 0 ? (
            <Card className="w-full max-w-2xl mx-auto mt-8 shadow-card border border-border dark:border-border-dark animate-fade-in">
              <CardBody className="p-8">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <Markdown>{output}</Markdown>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border dark:border-border-dark">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Supported by{" "}
              <NextUILink href="https://openbuild.xyz/" className="text-foreground dark:text-foreground font-medium hover:text-primary transition-colors">
                OpenBuild
              </NextUILink>{" "}
              &{" "}
              <NextUILink href="https://rss3.io/" className="text-foreground dark:text-foreground font-medium hover:text-primary transition-colors">
                RSS3
              </NextUILink>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">© 2024 {title}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
