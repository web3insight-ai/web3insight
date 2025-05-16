import { Button, Card, CardBody, CardHeader, Chip, Link as NextUILink, Divider, Input } from "@nextui-org/react";
import {
  json,
  LoaderFunctionArgs,
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import { Zap, ArrowRight, ArrowUpRight, ArrowDownRight, Database, Hash, TrendingUp, Search, Crown } from "lucide-react";
import BrandLogo from "@/components/control/brand-logo";
import { getUser } from "~/auth/repository";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";
import { ErrorType } from "~/query/helper";
import { insertOne, fetchListForUser } from "~/query/repository";
import { fetchStatisticsOverview, fetchStatisticsRank } from "~/statistics/repository";
import MetricOverviewWidget from "~/statistics/widgets/metric-overview";
import EcosystemRankWidget from "~/statistics/widgets/ecosystem-rank";
import RepositoryRankWidget from "~/statistics/widgets/repository-rank";

import { getMetadata } from "@/utils/app";

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
  const user = await getUser(ctx.request);
  const formData = await ctx.request.formData();

  const res = await insertOne({
    user,
    ipAddress: getClientIPAddress(ctx.request.headers),
    query: formData.get("query") as string,
  });

  return res.success && res.data ?
    redirect(`/query/${res.data.documentId}`) :
    json({
      type: res.extra?.type,
      error: res.message,
    }, { status: Number(res.code) });
};

// Define chip color type
type ChipColor = "success" | "primary" | "secondary" | "warning" | "default" | "danger";

// Data for display
const statsData = {
  totalMonthlyActiveDevelopers: 12500,
  totalCoreDevelopers: 3800,
  activeDevelopersByType: 8000,
  activeDevelopersByTenure: 4500,
  newDevelopers: 1200,
  totalCommits: 387500,
  totalRepositories: 32400,
  developerLocations: [
    { region: "North America", percentage: 28, count: 3500 },
    { region: "Europe", percentage: 24, count: 3000 },
    { region: "Asia", percentage: 22, count: 2750 },
    { region: "South America", percentage: 12, count: 1500 },
    { region: "Africa", percentage: 8, count: 1000 },
    { region: "Oceania", percentage: 6, count: 750 }
  ],
  topEcosystems: [
    {
      name: "Ethereum",
      developers: 3500,
      coreDevelopers: 820,
      growth: "+12%",
      color: "success" as ChipColor,
      monthlyCommits: 24800,
      developerLocations: [
        { region: "North America", percentage: 32 },
        { region: "Europe", percentage: 28 },
        { region: "Asia", percentage: 18 },
        { region: "Others", percentage: 22 }
      ]
    },
    {
      name: "Solana",
      developers: 2800,
      coreDevelopers: 650,
      growth: "+18%",
      color: "primary" as ChipColor,
      monthlyCommits: 19200,
      developerLocations: [
        { region: "North America", percentage: 35 },
        { region: "Europe", percentage: 25 },
        { region: "Asia", percentage: 22 },
        { region: "Others", percentage: 18 }
      ]
    },
    {
      name: "Polkadot",
      developers: 1900,
      coreDevelopers: 480,
      growth: "+5%",
      color: "secondary" as ChipColor,
      monthlyCommits: 12400,
      developerLocations: [
        { region: "Europe", percentage: 38 },
        { region: "North America", percentage: 24 },
        { region: "Asia", percentage: 20 },
        { region: "Others", percentage: 18 }
      ]
    },
    {
      name: "Near",
      developers: 1600,
      coreDevelopers: 390,
      growth: "+8%",
      color: "warning" as ChipColor,
      monthlyCommits: 9800,
      developerLocations: [
        { region: "North America", percentage: 30 },
        { region: "Europe", percentage: 26 },
        { region: "Asia", percentage: 24 },
        { region: "Others", percentage: 20 }
      ]
    },
    {
      name: "Cosmos",
      developers: 1200,
      coreDevelopers: 320,
      growth: "+7%",
      color: "success" as ChipColor,
      monthlyCommits: 8600,
      developerLocations: [
        { region: "Asia", percentage: 32 },
        { region: "North America", percentage: 28 },
        { region: "Europe", percentage: 25 },
        { region: "Others", percentage: 15 }
      ]
    },
  ],
  topRepositories: [
    { name: "ethereum/go-ethereum", stars: 42300, commits: 18540, contributors: 720 },
    { name: "solana-labs/solana", stars: 28900, commits: 15320, contributors: 680 },
    { name: "paritytech/substrate", stars: 23400, commits: 12780, contributors: 510 },
    { name: "near/nearcore", stars: 18600, commits: 9870, contributors: 420 },
    { name: "cosmos/cosmos-sdk", stars: 15200, commits: 8940, contributors: 380 },
  ],
  trendingTopics: [
    "Zero-Knowledge Proofs",
    "Layer 2 Solutions",
    "Cross-Chain Bridges",
    "DeFi Protocols",
    "NFT Marketplaces",
    "DAO Governance",
  ]
};

// Generate mock chart data for visualization
const generateChartData = (points: number, isPositive: boolean = true, volatility: number = 5) => {
  const data = [];
  let value = Math.random() * 50 + 50;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - (isPositive ? 0.4 : 0.6)) * volatility;
    value = Math.max(0, value + change);
    data.push(value);
  }

  return data;
};

// Add top developer data with ecosystem and project contributions
const topDevelopers = [
  {
    name: "jesse.eth",
    handle: "@jesse",
    contribution: "62.3k",
    growth: "+12.4%",
    isPositive: true,
    chartData: generateChartData(20, true, 6),
    ecosystems: ["Ethereum", "Optimism", "Arbitrum"],
    projects: ["ethereum/go-ethereum", "ethereum/consensus-specs", "optimism/optimism"]
  },
  {
    name: "haseeb",
    handle: "@haseeb_xyz",
    contribution: "51.7k",
    growth: "+8.2%",
    isPositive: true,
    chartData: generateChartData(20, true, 4),
    ecosystems: ["Solana", "Ethereum"],
    projects: ["solana-labs/solana", "solana/spl-token-wallet", "ethereum/EIPs"]
  },
  {
    name: "ajxbt",
    handle: "@ajxbt",
    contribution: "46.5k",
    growth: "+6.5%",
    isPositive: true,
    chartData: generateChartData(20, true, 5),
    ecosystems: ["Cosmos", "Polkadot", "Near"],
    projects: ["cosmos/cosmos-sdk", "near/nearcore", "paritytech/substrate"]
  },
  {
    name: "tomasz",
    handle: "@tomasz_k",
    contribution: "45.8k",
    growth: "+4.1%",
    isPositive: true,
    chartData: generateChartData(20, true, 7),
    ecosystems: ["Polkadot", "Kusama"],
    projects: ["paritytech/substrate", "paritytech/polkadot", "paritytech/smoldot"]
  },
  {
    name: "binji",
    handle: "@binji_x",
    contribution: "41.2k",
    growth: "-2.3%",
    isPositive: false,
    chartData: generateChartData(20, false, 4),
    ecosystems: ["Near", "Ethereum"],
    projects: ["near/nearcore", "near/workspaces", "ethereum/solidity"]
  },
];

export default function Index() {
  const { pinned, statisticOverview, statisticRank } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const asking = fetcher.state === "submitting";
  const errorMessage = fetcher.data?.error;
  const errorType = fetcher.data?.type;
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);

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

  // Simple line chart component
  const MiniChart = ({ data, color = "primary", height = 40 }: { data: number[], color?: string, height?: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    return (
      <div className="w-full h-full" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${data.length} ${range || 1}`} preserveAspectRatio="none">
          <path
            d={data.map((d, i) => `${i === 0 ? "M" : "L"} ${i} ${max - d + min}`).join(" ")}
            fill="none"
            stroke={`var(--${color})`}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        </svg>
      </div>
    );
  };

  // Growth indicator component
  const GrowthIndicator = ({ value, isPositive = true }: { value: string, isPositive?: boolean }) => {
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-success" : "text-danger"}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        <span>{value}</span>
      </div>
    );
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

            {/* Search Section - Prominently placed in hero section */}
            <div className="w-full max-w-[650px] mx-auto mt-12">
              <fetcher.Form method="POST" action="?index">
                <div className="relative">
                  <Input
                    name="query"
                    required
                    fullWidth
                    size="lg"
                    placeholder="Search ecosystem, repository, community..."
                    classNames={{
                      input: "h-12 text-base",
                      inputWrapper: "h-12 shadow-sm bg-white dark:bg-gray-800 pr-12 border border-gray-200 dark:border-gray-700"
                    }}
                    startContent={<Search size={18} className="text-gray-400" />}
                  />
                  <button
                    type="submit"
                    disabled={asking}
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
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <MetricOverviewWidget dataSource={statisticOverview} />

        {/* Developer Location Section */}
        <div className="mt-10">
          <div className="flex flex-col space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Distribution</h2>
            <p className="text-gray-500 dark:text-gray-400">Global distribution of Web3 developers by region</p>
          </div>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {statsData.developerLocations.map((location, index) => (
                  <div key={index} className="text-center p-4">
                    <div className="mb-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{location.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-2">
                      <div
                        className={`h-full rounded-full ${index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-secondary' :
                            index === 2 ? 'bg-success' :
                              index === 3 ? 'bg-warning' :
                                index === 4 ? 'bg-danger' : 'bg-default'
                          }`}
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{location.region}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{location.count.toLocaleString()} devs</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Section - Web3 Ecosystem Analytics */}
        <div className="mt-10">
          <div className="flex flex-col space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Web3 Ecosystem Analytics</h2>
            <p className="text-gray-500 dark:text-gray-400">Comprehensive insights about major blockchain ecosystems</p>
          </div>
          <EcosystemRankWidget dataSource={statisticRank.ecosystem} />
        </div>

        {/* Repository Activity Section */}
        <div className="mt-10">
          <div className="flex flex-col space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Repository Activity</h2>
            <p className="text-gray-500 dark:text-gray-400">Top repositories by developer engagement and contributions</p>
          </div>
          <RepositoryRankWidget dataSource={statisticRank.repository} />
        </div>

        {/* Developer Leaderboard Section */}
        <div className="mt-10">
          <div className="flex flex-col space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Developer Activity</h2>
            <p className="text-gray-500 dark:text-gray-400">Leading contributors across Web3 ecosystems</p>
          </div>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0.5">
              {topDevelopers.map((dev, index) => (
                <div key={index} className={`relative p-5 ${index === 0 ? 'border-t-4 border-primary' : index === 1 ? 'border-t-4 border-secondary' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/developer/${dev.handle.replace('@', '')}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary hover:underline">
                          {dev.handle}
                        </Link>
                        {index === 0 && <Crown size={14} className="text-primary fill-primary" />}
                      </div>
                    </div>
                    <GrowthIndicator value={dev.growth} isPositive={dev.isPositive} />
                  </div>

                  <div className="mt-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{dev.contribution}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">contributions</p>
                  </div>

                  <div className="mt-3 h-10">
                    <MiniChart data={dev.chartData} color={dev.isPositive ? "success" : "danger"} />
                  </div>

                  {/* Ecosystems contributed to */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ecosystems</p>
                    <div className="flex flex-wrap gap-1">
                      {dev.ecosystems.map((eco, ecoIndex) => (
                        <Chip key={ecoIndex} size="sm" variant="flat" color={
                          ecoIndex === 0 ? "primary" :
                            ecoIndex === 1 ? "secondary" : "default"
                        } className="text-xs">
                          {eco}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Projects contributed to */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Top Projects</p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      {dev.projects.map((proj, projIndex) => (
                        <li key={projIndex} className="truncate" title={proj}>
                          {proj}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Topic Popularity Metrics */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Popular Topics */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardHeader className="px-6 py-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-secondary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trending Topics</h3>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-6 py-4">
              <div className="space-y-4">
                {statsData.trendingTopics.slice(0, 3).map((topic, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {Math.round(80 - index * 10)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-secondary' :
                            'bg-success'
                          }`}
                        style={{ width: `${Math.round(80 - index * 10)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Trending Categories */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardHeader className="px-6 py-5">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {['DeFi', 'NFT', 'Gaming', 'Social', 'DAO', 'Infrastructure', 'Security', 'Privacy'].map((category, index) => (
                  <Chip
                    key={index}
                    variant="flat"
                    radius="sm"
                    className="text-xs cursor-pointer"
                    color={
                      index % 4 === 0 ? "primary" :
                        index % 4 === 1 ? "secondary" :
                          index % 4 === 2 ? "success" :
                            "default"
                    }
                  >
                    {category}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Top Growing Ecosystems */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
            <CardHeader className="px-6 py-5">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-success" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Highest Growth</h3>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-6 py-4 space-y-4">
              {statisticRank.ecosystem.slice(0, 3).map((eco, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{eco.eco_name}</span>
                  {/* <GrowthIndicator value={eco.growth} isPositive={eco.growth.startsWith('+')} /> */}
                </div>
              ))}
            </CardBody>
          </Card>
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
