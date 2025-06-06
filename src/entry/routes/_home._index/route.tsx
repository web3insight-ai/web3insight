import { Button, Card, CardBody, Chip, Link as NextUILink, Input } from "@nextui-org/react";
import {
  json,
  LoaderFunctionArgs,
  // redirect,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import { ArrowRight, Hash, Search } from "lucide-react";
// import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";

import { getMetadata } from "@/utils/app";
import BrandLogo from "@/components/control/brand-logo";

import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";

import { getUser } from "~/auth/repository";
import { ErrorType } from "~/query/helper";
import { fetchListForUser } from "~/query/repository";
import { fetchStatisticsOverview, fetchStatisticsRank } from "~/statistics/repository";
import EcosystemRankViewWidget from "~/ecosystem/views/ecosystem-rank";
import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";

import Section from "../../components/section";
import MetricOverview from "./MetricOverview";
import { fetchAnalyzedStatistics } from "~/ai/repository";

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

export const loader = async (ctx: LoaderFunctionArgs) => {
  const user = await getUser(ctx.request);
  const { data } = await fetchListForUser({ user });
  const { data: statisticOverview } = await fetchStatisticsOverview();
  const { data: statisticRank } = await fetchStatisticsRank();

  return json({ ...data, statisticOverview, statisticRank });
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
  const { pinned, statisticOverview, statisticRank } = useLoaderData<typeof loader>();
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
  const handleSignupClick = () => {
    setAuthModalType("signup");
    setAuthModalOpen(true);
  };

  const onClickHandle = () => {
    setOutput([]);
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
    <div className="min-h-dvh flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-slate-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              <BrandLogo className="drop-shadow-md" width={120} />
            </div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <MetricOverview dataSource={statisticOverview} />

        <Section
          className="mt-10"
          title="Web3 Ecosystem Analytics"
          summary="Comprehensive insights about major blockchain ecosystems"
        >
          <EcosystemRankViewWidget dataSource={statisticRank.ecosystem} />
        </Section>
        <Section
          className="mt-10"
          title="Repository Activity"
          summary="Top repositories by developer engagement and contributions"
        >
          <RepositoryRankViewWidget dataSource={statisticRank.repository} />
        </Section>
        <Section
          className="mt-10"
          title="Top Developer Activity"
          summary="Leading contributors across Web3 ecosystems"
        >
          <DeveloperRankViewWidget dataSource={statisticRank.developer} view="grid" />
        </Section>

        <div className="mt-16">
          {/* Search Section - Prominently placed in hero section */}
          <div className="w-full max-w-[650px] mx-auto">
            <fetcher.Form method="POST" action="?index">
              <div className="relative">
                <Input
                  name="query"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
                  fullWidth
                  size="lg"
                  placeholder="Search ecosystem, repository, community..."
                  classNames={{
                    input: "h-12 text-base",
                    inputWrapper: "h-12 shadow-sm bg-white dark:bg-gray-800 pr-12 border border-gray-200 dark:border-gray-700",
                  }}
                  startContent={<Search size={18} className="text-gray-400" />}
                />
                <button
                  type="submit"
                  disabled={asking}
                  onClick={onClickHandle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Try queries like &quot;ethereum ecosystem&quot;, &quot;OpenZeppelin/contracts&quot;, or &quot;openbuild community&quot;
            </p>
          </div>
          {/* Pinned Queries */}
          {pinned && pinned.length > 0 ? (
            <div className="mt-8">
              <div className="flex gap-2 items-center justify-center flex-wrap">
                {pinned.map((query) => (
                  <Link to={`/query/${query.documentId}`} key={query.documentId}>
                    <Chip
                      variant="flat"
                      color="default"
                      className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 cursor-pointer"
                      startContent={<Hash size={12} />}
                    >
                      {query.query}
                    </Chip>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            // If you want to show something when there are no pinned queries
            <div className="mt-8">
              <Link to="/query/new">
                <Button
                  variant="flat"
                  color="primary"
                  size="sm"
                  startContent={<Hash size={14} />}
                >
                  Start a new query
                </Button>
              </Link>
            </div>
          )}
          {output.length > 0 ? (
            <Card className="w-full max-w-[650px] mx-auto mt-8">
              <CardBody>
                <p className="text-gray-500 dark:text-gray-400 ">{output}</p>
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <Card className="bg-white dark:bg-gray-800 shadow-md border-none">
            <CardBody className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to explore deeper insights?</h2>
                <p className="text-gray-600 dark:text-gray-300">Sign up to access advanced analytics and custom reports.</p>
              </div>
              <div className="flex gap-3">
                <Button color="primary" size="lg" className="font-medium" onClick={handleSignupClick}>
                  Sign up free
                </Button>
                <Button variant="bordered" size="lg" className="font-medium">
                  Learn more
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <p className="font-medium text-gray-600 dark:text-gray-300 mb-3">
              Supported by{" "}
              <NextUILink href="https://openbuild.xyz/" className="text-primary hover:underline">
                OpenBuild
              </NextUILink>{" "}
              &{" "}
              <NextUILink href="https://rss3.io/" className="text-primary hover:underline">
                RSS3
              </NextUILink>
            </p>
            <div className="flex flex-wrap justify-center gap-5 text-gray-600 dark:text-gray-400 mt-4 text-sm">
              <NextUILink href="#" className="hover:text-primary transition-colors">About</NextUILink>
              <NextUILink href="#" className="hover:text-primary transition-colors">Documentation</NextUILink>
              <NextUILink href="#" className="hover:text-primary transition-colors">API</NextUILink>
              <NextUILink href="#" className="hover:text-primary transition-colors">Privacy</NextUILink>
              <NextUILink href="#" className="hover:text-primary transition-colors">Terms</NextUILink>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">© 2024 {title}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
