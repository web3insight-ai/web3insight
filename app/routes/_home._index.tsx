import { Button, Code, Image, Input } from "@nextui-org/react";
import {
	json,
	LoaderFunctionArgs,
	redirect,
	type ActionFunctionArgs,
	type MetaFunction,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Search } from "lucide-react";
import { getSearchKeyword } from "~/engine.server";
import { prisma } from "~/prisma.server";
import Logo from "../images/logo.png";
import { getAuth } from "@clerk/remix/ssr.server";
import { Prisma } from "@prisma/client";
import { guestSearchLimiter, userSearchLimiter } from "~/limiter.server";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useEffect } from "react";

export enum ErrorType {
	Basic = "Basic",
	SigninNeeded = "SigninNeeded",
	ReachMaximized = "ReachMaximized",
}

export const meta: MetaFunction = () => {
	return [
		{ title: "Web3Insights" },
		{
			property: "og:title",
			content: "Web3Insights",
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

export default function Index() {
	const fetcher = useFetcher<typeof action>();
	const asking = fetcher.state === "submitting";

	const loaderData = useLoaderData<typeof loader>();
	const pinned = loaderData.pinned;

	const errorMessage = fetcher.data?.error;
	const errorType = fetcher.data?.type;

	useEffect(() => {
		if (fetcher.state === "idle" && errorMessage) {
			if (errorType === ErrorType.SigninNeeded) {
				// Handle sign-in needed error
				console.log("Sign-in needed");
			}
			if (errorType === ErrorType.ReachMaximized) {
				// Handle usage limit reached error
				console.log("Usage limit reached");
			}
		}
	}, [fetcher.state, errorMessage, errorType]);

	return (
		<div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 py-8">
			<div className="w-full max-w-[640px] mx-auto">
				<div className="space-y-4 text-center flex flex-col items-center">
					<div className="mb-10 mt-16 sm:mt-8 transform hover:scale-105 transition-transform duration-300">
						<Image src={Logo} width={148} alt="Web3Insights Logo" className="drop-shadow-lg" />
					</div>
					<Link
						to="/claim-reward"
						className="bg-gradient-to-r from-primary/90 to-primary-500 text-white py-3.5 px-6 rounded-lg text-center shadow-lg inline-flex items-center justify-center gap-3 hover:scale-102 hover:shadow-xl transition-all duration-300 font-semibold tracking-wide w-full max-w-[580px]"
					>
						<span className="animate-bounce">🎁</span>
						Claim Web3Insights & Mantle Network Badge Now!!!
						<span className="animate-bounce">🎁</span>
					</Link>
					<h1 className="text-2xl md:text-3xl font-bold mt-10 text-gray-800 leading-tight max-w-[520px]">
						An Intelligent Metric System for Evaluating Web3 Ecosystems,
						Communities and Repos.
					</h1>
				</div>

				<fetcher.Form method="POST" action="?index" className="mt-10">
					<div className="flex flex-col gap-3 items-center">
						<Input
							endContent={
								<Button
									isLoading={asking}
									startContent={
										asking ? null : <Search size={18} strokeWidth={1.5} />
									}
									size="sm"
									type="submit"
									color="primary"
									isIconOnly
									className="min-w-[44px] shadow-md hover:shadow-lg transition-shadow"
								/>
							}
							description="Insight data for Web3 Ecosystems, Communities and Repos."
							size="lg"
							isInvalid={!!errorMessage}
							errorMessage={errorMessage}
							placeholder="Search Ecosystem, Community, Repo, Address..."
							variant="bordered"
							required
							name="query"
							type="text"
							className="max-w-full shadow-sm hover:shadow transition-shadow"
						/>
					</div>
				</fetcher.Form>

				<div className="mt-10">
					<div className="flex gap-3 items-center justify-center flex-wrap">
						{pinned.map((query) => (
							<Link to={`/query/${query.id}`} key={query.id}>
								<Code className="text-sm px-4 py-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
									{query.query}
								</Code>
							</Link>
						))}
					</div>
				</div>

				<div className="mt-14 text-center font-medium text-gray-600">
					Supported by{" "}
					<a href="https://openbuild.xyz/" className="text-primary hover:text-primary-600 transition-colors underline decoration-2 underline-offset-2">
						OpenBuild
					</a>{" "}
					&{" "}
					<a href="https://rss3.io/" className="text-primary hover:text-primary-600 transition-colors underline decoration-2 underline-offset-2">
						RSS3
					</a>
				</div>
			</div>
		</div>
	);
}
