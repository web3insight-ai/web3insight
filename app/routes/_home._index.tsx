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
		<div className="min-h-dvh flex items-center justify-center px-4 py-8">
			<Link
				to="/claim-reward"
				className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary/80 to-primary-400 text-white py-3 text-center shadow-md inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-200 font-medium tracking-wide"
			>
				<span className="animate-pulse">🎁</span>
				Claim Web3Insights & Mantle Network Badge Now!!!
				<span className="animate-pulse">🎁</span>
			</Link>
			<div className="w-full max-w-[640px] mx-auto">
				<div className="space-y-2 text-center flex flex-col items-center">
					<div className="mb-8 mt-16 sm:mt-8">
						<Image src={Logo} width={128} alt="Web3Insights Logo" />
					</div>
					<h1 className="text-2xl md:text-3xl font-bold">
						An Intelligent Metric System for Evaluating Web3 Ecosystems,
						Communities and Repos.
					</h1>
				</div>

				<fetcher.Form method="POST" action="?index" className="mt-8">
					<div className="flex flex-col gap-2 items-center">
						<Input
							endContent={
								<Button
									isLoading={asking}
									startContent={
										asking ? null : <Search size={16} strokeWidth={1.5} />
									}
									size="sm"
									type="submit"
									color="primary"
									isIconOnly
									className="min-w-[40px]"
								/>
							}
							description="Insight data for Web3 Ecosystems, Communities and Repos."
							size="lg"
							isInvalid={!!errorMessage}
							errorMessage={errorMessage}
							placeholder="Ecosystem, Community, Repo, Address, ..."
							variant="bordered"
							required
							name="query"
							type="text"
							className="max-w-full"
						/>
					</div>
				</fetcher.Form>

				<div className="mt-8">
					<div className="flex gap-3 items-center justify-center flex-wrap">
						{pinned.map((query) => (
							<Link to={`/query/${query.id}`} key={query.id}>
								<Code className="text-xs">{query.query}</Code>
							</Link>
						))}
					</div>
				</div>

				<div className="mt-12 text-center font-medium">
					Supported by{" "}
					<a href="https://openbuild.xyz/" className="underline">
						OpenBuild
					</a>{" "}
					&{" "}
					<a href="https://rss3.io/" className="underline">
						RSS3
					</a>
				</div>
			</div>
		</div>
	);
}
