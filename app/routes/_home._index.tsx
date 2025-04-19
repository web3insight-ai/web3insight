import { Button, Card, CardBody, CardFooter, CardHeader, Image, Chip, Link as NextUILink, Divider, Input } from "@nextui-org/react";
import {
	json,
	LoaderFunctionArgs,
	redirect,
	type ActionFunctionArgs,
	type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import { Code2, Github, Users, Warehouse, Zap, ArrowRight, ArrowUpRight, ArrowDownRight, Database, Hash, TrendingUp, Search, Crown } from "lucide-react";
import { getSearchKeyword } from "~/engine.server";
import { prisma } from "~/prisma.server";
import Logo from "../images/logo.png";
import { getAuth } from "@clerk/remix/ssr.server";
import { Prisma } from "@prisma/client";
import { guestSearchLimiter, userSearchLimiter } from "~/limiter.server";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "~/atoms";

export enum ErrorType {
	Basic = "Basic",
	SigninNeeded = "SigninNeeded",
	ReachMaximized = "ReachMaximized",
}

export const meta: MetaFunction = () => {
	return [
		{ title: "Web3Insights - Developer Report" },
		{
			property: "og:title",
			content: "Web3Insights - Developer Report",
		},
		{
			name: "description",
			content:
				"A comprehensive metric system for evaluating Web3 Ecosystems, Communities and Repos.",
		},
	];
};

export const loader = async (ctx: LoaderFunctionArgs) => {
	const auth = await getAuth(ctx);

	let history: {
		query: string;
		id: string;
	}[] = [];

	if (auth.userId) {
		history = await prisma.query.findMany({
			where: {
				owner: {
					clerkUserId: auth.userId,
				},
			},
			select: {
				id: true,
				query: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10,
		});
	}

	const pinned = await prisma.query.findMany({
		where: {
			pin: true,
		},
		select: {
			id: true,
			query: true,
		},
	});

	return json({
		pinned,
		history,
	});
};

export const action = async (ctx: ActionFunctionArgs) => {
	const auth = await getAuth(ctx);

	let searchLimiter = guestSearchLimiter;
	let key = getClientIPAddress(ctx.request.headers) || "unknown";

	if (auth.userId) {
		searchLimiter = userSearchLimiter;
		key = auth.userId;
	}

	try {
		await searchLimiter.consume(key, 1);
	} catch (e) {
		// reach limit
		if (auth.userId) {
			return json({
				type: ErrorType.ReachMaximized,
				error: "Usage limit exceeded",
			});
		}

		return json({
			type: ErrorType.SigninNeeded,
			error: "Usage limit exceeded",
		});
	}

	const formData = await ctx.request.formData();
	const query = formData.get("query") as string;

	if (query.length > 100) {
		return json({
			type: ErrorType.Basic,
			error: "Query is too long",
		});
	}

	const keyword = await getSearchKeyword(query);

	if (!keyword) {
		return json(
			{ error: "Not supported yet", type: ErrorType.Basic },
			{ status: 400 },
		);
	}

	const owner = auth.userId
		? ({
				connectOrCreate: {
					where: {
						clerkUserId: auth.userId,
					},
					create: {
						clerkUserId: auth.userId,
					},
				},
			} satisfies Prisma.UserCreateNestedOneWithoutQueriesInput)
		: undefined;

	if (query) {
		const newQuery = await prisma.query.create({
			data: {
				query,
				keyword,
				owner,
			},
		});
		return redirect(`/query/${newQuery.id}`);
	}

	return json(
		{ error: "No query provided", type: ErrorType.Basic },
		{ status: 400 },
	);
};

// Define chip color type
type ChipColor = "success" | "primary" | "secondary" | "warning" | "default" | "danger";

// Data for display
const statsData = {
	totalMonthlyActiveDevelopers: 12500,
	activeDevelopersByType: 8000,
	activeDevelopersByTenure: 4500,
	newDevelopers: 1200,
	totalCommits: 387500,
	totalRepositories: 32400,
	topEcosystems: [
		{ name: "Ethereum", developers: 3500, growth: "+12%", color: "success" as ChipColor },
		{ name: "Solana", developers: 2800, growth: "+18%", color: "primary" as ChipColor },
		{ name: "Polkadot", developers: 1900, growth: "+5%", color: "secondary" as ChipColor },
		{ name: "Near", developers: 1600, growth: "+8%", color: "warning" as ChipColor },
		{ name: "Cosmos", developers: 1200, growth: "+7%", color: "success" as ChipColor },
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

// Add repository activity data with chart data
const enhancedRepoData = statsData.topRepositories.map(repo => ({
	...repo,
	chartData: generateChartData(20, Math.random() > 0.3, 8),
	growth: Math.random() > 0.5 ? `+${(Math.random() * 20).toFixed(1)}%` : `-${(Math.random() * 10).toFixed(1)}%`,
	isPositive: Math.random() > 0.3
}));

// Add ecosystem data with chart data
const enhancedEcosystemData = statsData.topEcosystems.map(ecosystem => ({
	...ecosystem,
	chartData: generateChartData(20, ecosystem.growth.startsWith('+'), 6)
}));

// Add top developer data
const topDevelopers = [
	{ name: "jesse.eth", handle: "@jesse", contribution: "62.3k", growth: "+12.4%", isPositive: true, chartData: generateChartData(20, true, 6) },
	{ name: "haseeb", handle: "@haseeb_xyz", contribution: "51.7k", growth: "+8.2%", isPositive: true, chartData: generateChartData(20, true, 4) },
	{ name: "ajxbt", handle: "@ajxbt", contribution: "46.5k", growth: "+6.5%", isPositive: true, chartData: generateChartData(20, true, 5) },
	{ name: "tomasz", handle: "@tomasz_k", contribution: "45.8k", growth: "+4.1%", isPositive: true, chartData: generateChartData(20, true, 7) },
	{ name: "binji", handle: "@binji_x", contribution: "41.2k", growth: "-2.3%", isPositive: false, chartData: generateChartData(20, false, 4) },
];

export default function Index() {
	const { pinned } = useLoaderData<typeof loader>();
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
			if (errorType === ErrorType.ReachMaximized) {
				// Handle usage limit reached error
				console.log("Usage limit reached");
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
							<Image
								src={Logo}
								width={120}
								alt="Web3Insights Logo"
								className="drop-shadow-md"
							/>
						</div>
						<p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
							A comprehensive metric system for evaluating Web3 Ecosystems, Communities and Repos.
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
						{pinned.length > 0 && (
							<div className="mt-8">
								<div className="flex gap-2 items-center justify-center flex-wrap">
									{pinned.map((query) => (
										<Link to={`/query/${query.id}`} key={query.id}>
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
						)}
					</div>
				</div>
			</div>

			<div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
				{/* Key Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
					<Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
						<CardBody className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
									<Users size={20} className="text-primary" />
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Active Developers</p>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
										{statsData.totalMonthlyActiveDevelopers.toLocaleString()}
									</h2>
									<GrowthIndicator value="+8.3%" isPositive={true} />
								</div>
							</div>
						</CardBody>
					</Card>

					<Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
						<CardBody className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
									<Code2 size={20} className="text-secondary" />
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Total Commits</p>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
										{statsData.totalCommits.toLocaleString()}
									</h2>
									<GrowthIndicator value="+12.7%" isPositive={true} />
								</div>
							</div>
						</CardBody>
					</Card>

					<Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
						<CardBody className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-success/10 rounded-xl flex-shrink-0">
									<Zap size={20} className="text-success" />
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">New Developers</p>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
										{statsData.newDevelopers.toLocaleString()}
									</h2>
									<GrowthIndicator value="+5.2%" isPositive={true} />
								</div>
							</div>
						</CardBody>
					</Card>

					<Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
						<CardBody className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-warning/10 rounded-xl flex-shrink-0">
									<Database size={20} className="text-warning" />
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Repositories</p>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
										{statsData.totalRepositories.toLocaleString()}
									</h2>
									<GrowthIndicator value="+3.5%" isPositive={true} />
								</div>
							</div>
						</CardBody>
					</Card>
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
								<div key={index} className={`relative p-4 ${index < 2 ? 'border-t-4' : ''} ${index === 0 ? 'border-primary' : index === 1 ? 'border-secondary' : ''}`}>
									<div className="flex justify-between items-start">
										<div>
											<div className="flex items-center gap-2">
												<span className="font-semibold text-gray-900 dark:text-white">{dev.name}</span>
												{index === 0 && <Crown size={14} className="text-primary fill-primary" />}
											</div>
											<p className="text-xs text-gray-500 dark:text-gray-400">{dev.handle}</p>
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
								</div>
							))}
						</div>
					</Card>
				</div>

				{/* Main Content Section */}
				<div className="mt-10">
					<div className="flex flex-col space-y-1 mb-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Web3 Ecosystem Analytics</h2>
						<p className="text-gray-500 dark:text-gray-400">Comprehensive insights about major blockchain ecosystems</p>
					</div>

					{/* Main Content Grid */}
					<Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
						<CardHeader className="px-6 py-5">
							<div className="flex items-center gap-2">
								<Warehouse size={18} className="text-primary" />
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Ecosystems</h3>
							</div>
						</CardHeader>
						<Divider />
						<CardBody className="p-0">
							<div className="divide-y divide-gray-100 dark:divide-gray-800">
								{enhancedEcosystemData.map((ecosystem, index) => (
									<div key={index} className="px-6 py-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
										{/* Rank indicator */}
										<div className="w-8 flex-shrink-0">
											<span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
												${index === 0 ? 'bg-primary/10 text-primary' :
												index === 1 ? 'bg-secondary/10 text-secondary' :
												'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
												text-xs font-medium`}>{index + 1}</span>
										</div>

										{/* Ecosystem name and growth */}
										<div className="w-5/12 flex items-center gap-3">
											<span className="font-medium text-gray-900 dark:text-white">{ecosystem.name}</span>
											<Chip size="sm" color={ecosystem.color} variant="flat">
												{ecosystem.growth}
											</Chip>
										</div>

										{/* Developer count */}
										<div className="w-3/12 text-gray-700 dark:text-gray-300 font-medium">
											{ecosystem.developers.toLocaleString()} devs
										</div>

										{/* Chart */}
										<div className="w-3/12 h-10">
											<MiniChart
												data={ecosystem.chartData}
												color={ecosystem.growth.startsWith('+') ? "success" : "danger"}
											/>
										</div>
									</div>
								))}
							</div>
						</CardBody>
						<Divider />
						<CardFooter className="px-6 py-3">
							<Button as={Link} to="#" color="primary" variant="light" size="sm" endContent={<ArrowRight size={14} />} className="ml-auto">
								View all ecosystems
							</Button>
						</CardFooter>
					</Card>

					{/* Topic Popularity Metrics */}
					<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
													className={`h-full rounded-full ${
														index === 0 ? 'bg-primary' :
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
								{enhancedEcosystemData.slice(0, 3).map((eco, index) => (
									<div key={index} className="flex items-center gap-3">
										<div className="w-2 h-2 rounded-full bg-success"></div>
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{eco.name}</span>
										<GrowthIndicator value={eco.growth} isPositive={eco.growth.startsWith('+')} />
									</div>
								))}
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Top Repositories Section */}
				<div className="mt-10">
					<div className="flex flex-col space-y-1 mb-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Repository Activity</h2>
						<p className="text-gray-500 dark:text-gray-400">Top repositories by developer engagement and contributions</p>
					</div>

					<Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
						{/* Repository icon header */}
						<CardHeader className="px-8 py-5">
							<div className="flex items-center gap-2">
								<Github size={18} className="text-primary" />
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Repositories</h3>
							</div>
						</CardHeader>
						<Divider />

						{/* Repository rows */}
						<div>
							{enhancedRepoData.map((repo, index) => (
								<div
									key={index}
									className="px-8 py-4 flex items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
								>
									{/* Rank number */}
									<div className="w-8 flex-shrink-0">
										<span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
											${index === 0 ? 'bg-blue-50 text-blue-600' :
											index === 1 ? 'bg-purple-50 text-purple-600' :
											'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
											text-xs font-medium`}>{index + 1}</span>
									</div>

									{/* Repository name */}
									<div className="w-5/12 flex items-center">
										<span className="font-medium text-gray-900 dark:text-white">{repo.name}</span>
										<span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
											repo.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
										}`}>
											{repo.growth}
										</span>
									</div>

									{/* Stars count right-aligned */}
									<div className="flex-1 text-right font-medium text-gray-700 dark:text-gray-300">
										{repo.stars.toLocaleString()} stars
									</div>
								</div>
							))}
						</div>

						{/* Footer with right-aligned button */}
						<Divider />
						<CardFooter className="px-6 py-3">
							<Button
								as={Link}
								to="#"
								color="primary"
								variant="light"
								size="sm"
								endContent={<ArrowRight size={14} />}
								className="ml-auto"
							>
								View all repositories
							</Button>
						</CardFooter>
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
						<p className="text-xs text-gray-500 dark:text-gray-500 mt-6">© 2024 Web3Insights. All rights reserved.</p>
					</div>
				</footer>
			</div>
		</div>
	);
}
