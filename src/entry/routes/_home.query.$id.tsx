import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { useEventSource } from "remix-utils/sse/react";
import Markdown from "react-markdown";
import {
  Button,
  Code,
  Input,
  Skeleton,
  Spinner,
  Link,
  Chip,
} from "@nextui-org/react";
import { Sparkles, ExternalLink, BadgeCent } from "lucide-react";
import { Footer } from "#/components/Footer";
import { useAtom } from "jotai";
import { signinModalOpenAtom } from "#/atoms";
import OpenRankChart from "#/components/OpenRankChart";
import AttentionChart from "#/components/AttentionChart";
import ParticipantsChart from "#/components/ParticipantsChart";
import CommunityOpenRank from "#/components/CommunityOpenRank";
import axios from "axios";
import { isAddress } from "viem";
import { motion, AnimatePresence } from "framer-motion";

import { getVar } from "@/utils/env";
import { getMetadata } from "@/utils/app";

import { getUser } from "~/auth/repository";
import type { Query } from "~/query/typing";
import { ErrorType } from "~/query/helper";
import { fetchSearchedList, fetchOneWithUser } from "~/query/repository";
import { fetchOne as fetchEcosystem } from "~/ecosystem/repository";

const opendiggerUrl = getVar("OPENDIGGER_URL");

const { title: appTitle, description } = getMetadata();

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data ? `${data.query} - ${appTitle}` : appTitle;
  const answer = data?.answer;

  return [
    { title },
    { property: "og:title", content: title },
    {
      name: "description",
      content: answer
        ? `${answer.slice(0, 300)}...`
        : description,
    },
  ];
};

async function fetchOpenDiggerData(name: string, type: string) {
  const url = `${opendiggerUrl}/${name}/${type}.json`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    return null;
  }
}

async function fetchParticipantsData(repoName: string) {
  const baseUrl = `${opendiggerUrl}/github`;
  try {
    const [participants, newContributors, inactiveContributors] =
      await Promise.all([
        fetch(`${baseUrl}/${repoName}/participants.json`).then((res) =>
          res.json(),
        ),
        fetch(`${baseUrl}/${repoName}/new_contributors.json`).then((res) =>
          res.json(),
        ),
        fetch(`${baseUrl}/${repoName}/inactive_contributors.json`).then((res) =>
          res.json(),
        ),
      ]);
    return { participants, newContributors, inactiveContributors };
  } catch (error) {
    return null;
  }
}

async function fetchCommunityOpenRankData(repoName: string) {
  const url = `${opendiggerUrl}/github/${repoName}/community_openrank.json`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    // Sort the months in descending order
    const sortedMonths = Object.keys(data.data).sort((a, b) =>
      b.localeCompare(a),
    );

    // Get the most recent 6 months
    const recentMonths = sortedMonths.slice(0, 6);

    // Create a new object with only the recent months' data
    const recentData: Record<string, Record<string, number>> = {};
    recentMonths.forEach((month) => {
      recentData[month] = data.data[month];
    });

    // Return the modified data object
    return {
      ...data,
      data: recentData,
    };
  } catch (error) {
    return null;
  }
}

export const loader = async (ctx: LoaderFunctionArgs) => {
  const user = await getUser(ctx.request);

  let history: Query[] = [];

  // Fetch user's query history from Strapi if user is logged in
  if (user && user.id) {
    history = (await fetchSearchedList({ userId: user.id })).data;
  }

  const queryId = ctx.params.id as string;

  // Fetch query from Strapi
  try {
    const res = await fetchOneWithUser(queryId);

    if (!res.success || !res.data) {
      return redirect("/");
    }

    const query = res.data;
    const keyword = query.keyboard || ""; // Note: keyboard is used instead of keyword due to schema

    let openRankData = null;
    let attentionData = null;
    let participantsData = null;
    let communityOpenRankData = null;
    let projectData = null;

    if (keyword) {
      const type =
        isAddress(keyword) || keyword.endsWith(".eth")
          ? "evm"
          : keyword.includes("/")
            ? "github_repo"
            : "other";

      if (type === "github_repo") {
        const openDiggerName = `github/${keyword}`;
        openRankData = await fetchOpenDiggerData(openDiggerName, "openrank");
        attentionData = await fetchOpenDiggerData(openDiggerName, "attention");
        participantsData = await fetchParticipantsData(keyword);
        communityOpenRankData = await fetchCommunityOpenRankData(keyword);
      }

      // Fetch project data from Strapi API
      projectData = (await fetchEcosystem(keyword)).data;
    }

    return json({
      query: query.query,
      answer: query.answer,
      keyword,
      references: null, // This doesn't seem to be in the new schema
      history,
      openRankData,
      attentionData,
      participantsData,
      communityOpenRankData,
      projectData,
    });
  } catch (error) {
    console.error("Error fetching query:", error);
    return redirect("/");
  }
};

function Placeholder() {
  return (
    <div>
      <div className="space-y-3">
        <Skeleton className="w-full h-3 rounded-full" />
        <Skeleton className="w-full h-3 rounded-full" />
        <Skeleton className="w-full h-3 rounded-full" />
      </div>
    </div>
  );
}

export default function QueryPage() {
  const loaderData = useLoaderData<typeof loader>();
  const params = useParams();

  const result = useEventSource(`/completion/${params.id}`);
  const askFetcher = useFetcher<{ error: string; type: ErrorType }>();
  const askErrorMessage = askFetcher.data?.error;
  const askErrorType = askFetcher.data?.type;

  const analyzeFetcher = useFetcher<{ error: string; type: ErrorType }>();
  const analyzing = analyzeFetcher.state === "submitting";

  const rewardFetcher = useFetcher<{ error: string; type: ErrorType }>();
  const sending = rewardFetcher.state === "submitting";

  const asking = askFetcher.state === "submitting";

  const [isChartLoading, setIsChartLoading] = useState(true);
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);

  const parsedAnswer = useMemo(() => {
    if (!result) return { content: "" };
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error("Error parsing result:", error);
      return { content: "" };
    }
  }, [result]);

  const [, setSigninModalOpen] = useAtom(signinModalOpenAtom);

  useEffect(() => {
    if (
      askFetcher.state === "idle" &&
      askErrorMessage &&
      askErrorType === ErrorType.SigninNeeded
    ) {
      setSigninModalOpen(true);
    }
  }, [askFetcher.state, askErrorMessage, askErrorType, setSigninModalOpen]);

  useEffect(() => {
    if (
      loaderData.openRankData ||
      loaderData.attentionData ||
      loaderData.participantsData ||
      loaderData.communityOpenRankData
    ) {
      const timer = setTimeout(() => setIsChartLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [
    loaderData.openRankData,
    loaderData.attentionData,
    loaderData.participantsData,
    loaderData.communityOpenRankData,
  ]);

  const isGithubRepo = loaderData.keyword?.includes("/");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-bold text-2xl sm:text-4xl mb-4 text-gray-800"
        >
          {loaderData.query}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Code
            size="sm"
            className="text-xs sm:text-sm px-2 sm:px-3 py-1"
            radius="full"
          >
            {loaderData.keyword}
          </Code>
        </motion.div>

        {loaderData.projectData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8 sm:mb-10 bg-white rounded-xl shadow-lg p-4 sm:p-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex-grow">
                <h3 className="text-2xl font-semibold mb-2">
                  {loaderData.projectData.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {loaderData.projectData.description}
                </p>
                <div className="flex items-center space-x-4">
                  <Chip
                    color={
                      loaderData.projectData.type === "ecosystem"
                        ? "primary"
                        : "secondary"
                    }
                    size="sm"
                  >
                    {loaderData.projectData.type}
                  </Chip>
                  <Link
                    href={loaderData.projectData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:underline transition-colors duration-200"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    Website
                  </Link>
                </div>
              </div>
              <img
                src={loaderData.projectData.logo}
                alt={loaderData.projectData.name}
                className="w-24 h-24 object-contain ml-4"
              />
            </div>
          </motion.div>
        )}

        {loaderData.projectData?.type !== "ecosystem" &&
          loaderData.projectData?.type !== "community" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8 sm:mb-10 bg-white rounded-xl shadow-lg p-4 sm:p-6"
            >
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Placeholder />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-sm sm:text-base text-gray-800 leading-relaxed">
                      <Markdown>{parsedAnswer.content}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        {loaderData.projectData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-8 sm:mb-10 bg-white rounded-xl shadow-lg p-6 sm:p-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Core Contributors */}
              <div className="w-full lg:w-1/2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Core Contributors
                </h3>
                <div className="h-[400px] overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 text-center text-gray-600 font-semibold border-b border-gray-200 w-16">
                          No.
                        </th>
                        <th className="p-3 text-center text-gray-600 font-semibold border-b border-gray-200">
                          Contributor
                        </th>
                        <th className="p-3 text-center text-gray-600 font-semibold border-b border-gray-200">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="relative">
                      <AnimatePresence>
                        {loaderData.projectData.coreContributors?.map(
                          (contributor: string, index: number) => (
                            <motion.tr
                              key={contributor}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              className="transition-colors duration-200 ease-in-out hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <td className="p-2 border-r border-gray-100">
                                <div className="font-medium text-center">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <a
                                  href={`https://github.com/${contributor}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center justify-center"
                                >
                                  <span>{contributor}</span>
                                  <ExternalLink
                                    size={14}
                                    className="ml-1 text-gray-400"
                                  />
                                </a>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    color="primary"
                                    isDisabled
                                    aria-label="Analysis"
                                    className="text-white"
                                    title="Analysis"
                                  >
                                    <Sparkles size={16} />
                                  </Button>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    color="secondary"
                                    aria-label="Reward"
                                    title="Reward"
                                    isLoading={
                                      sending &&
                                      rewardFetcher.formAction ===
                                      `/reward/${contributor}`
                                    }
                                    isDisabled={
                                      sending &&
                                      rewardFetcher.formAction !==
                                      `/reward/${contributor}`
                                    }
                                    onClick={() => {
                                      if (loaderData.projectData) {
                                        const projectName =
                                          loaderData.projectData.name;
                                        rewardFetcher.submit(
                                          { projectName },
                                          {
                                            method: "POST",
                                            action: `/reward/${contributor}`,
                                          },
                                        );
                                      } else {
                                        console.error("Project data is null");
                                        // You might want to show an error message to the user here
                                      }
                                    }}
                                    className="text-white"
                                  >
                                    <BadgeCent size={16} />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          ),
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Core Repositories */}
              <div className="w-full lg:w-1/2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Core Repositories
                </h3>
                <div className="h-[400px] overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 text-center text-gray-600 font-semibold border-b border-gray-200 w-16">
                          No.
                        </th>
                        <th className="p-3 text-center text-gray-600 font-semibold border-b border-gray-200">
                          Repository
                        </th>
                        <th className="p-3 text-center text-gray-600 font-semibold border-b border-gray-200">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="relative">
                      <AnimatePresence>
                        {loaderData.projectData.coreRepos.map((repo: string, index: number) => (
                          <motion.tr
                            key={repo}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.05,
                            }}
                            className="transition-colors duration-200 ease-in-out hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <td className="p-2 border-r border-gray-100">
                              <div className="font-medium text-center">
                                {index + 1}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <a
                                href={`https://github.com/${repo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center justify-center"
                              >
                                <span>{repo}</span>
                                <ExternalLink
                                  size={14}
                                  className="ml-1 text-gray-400"
                                />
                              </a>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center space-x-2">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="primary"
                                  aria-label="Analysis"
                                  className="text-white"
                                  title="Analysis"
                                  isLoading={
                                    analyzing && analyzingRepo === repo
                                  }
                                  isDisabled={
                                    analyzing && analyzingRepo !== repo
                                  }
                                  onClick={() => {
                                    setAnalyzingRepo(repo);
                                    const newQuery = `Analyze the GitHub repository ${repo}`;
                                    analyzeFetcher.submit(
                                      { query: newQuery },
                                      { method: "post", action: "/" }
                                    );
                                  }}
                                >
                                  <Sparkles size={16} />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap -mx-2 sm:-mx-3">
          {loaderData.communityOpenRankData &&
            loaderData.keyword &&
            isGithubRepo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="w-full px-2 sm:px-3 mb-4 sm:mb-6"
              >
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  {isChartLoading ? (
                    <div className="flex justify-center items-center h-[400px] sm:h-[800px]">
                      <Spinner size="lg" color="primary" />
                    </div>
                  ) : (
                    <CommunityOpenRank
                      repoName={loaderData.keyword}
                      graphData={loaderData.communityOpenRankData}
                    />
                  )}
                </div>
              </motion.div>
            )}

          {loaderData.openRankData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="w-full sm:w-1/2 px-2 sm:px-3 mb-4 sm:mb-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                {isChartLoading ? (
                  <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : (
                  <OpenRankChart
                    data={loaderData.openRankData}
                    repoName={loaderData.keyword}
                  />
                )}
              </div>
            </motion.div>
          )}

          {loaderData.attentionData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="w-full sm:w-1/2 px-2 sm:px-3 mb-4 sm:mb-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                {isChartLoading ? (
                  <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : (
                  <AttentionChart
                    data={loaderData.attentionData}
                    repoName={loaderData.keyword}
                  />
                )}
              </div>
            </motion.div>
          )}

          {loaderData.participantsData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="w-full px-2 sm:px-3 mb-4 sm:mb-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                {isChartLoading ? (
                  <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : (
                  <ParticipantsChart
                    data={{
                      participants: loaderData.participantsData?.participants ?
                        (typeof loaderData.participantsData.participants === 'object' ?
                          loaderData.participantsData.participants : {}) : {},
                      newContributors: loaderData.participantsData?.newContributors ?
                        (typeof loaderData.participantsData.newContributors === 'object' ?
                          loaderData.participantsData.newContributors : {}) : {},
                      inactiveContributors: loaderData.participantsData?.inactiveContributors ?
                        (typeof loaderData.participantsData.inactiveContributors === 'object' ?
                          loaderData.participantsData.inactiveContributors : {}) : {},
                    }}
                    repoName={loaderData.keyword || ''}
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="mt-8 sm:mt-12"
        >
          <askFetcher.Form method="POST" action="/">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <Input
                placeholder="Evaluate a new one..."
                variant="bordered"
                required
                name="query"
                type="text"
                className="flex-grow"
                isInvalid={!!askErrorMessage}
                errorMessage={askErrorMessage}
              />
              <Button
                isLoading={asking}
                startContent={asking ? null : <Sparkles />}
                type="submit"
                color="primary"
                className="w-full sm:w-auto"
              >
                Ask
              </Button>
            </div>
          </askFetcher.Form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
