import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import {
	openai,
	PROMPT,
	analyzeInfo,
	getInfo,
	getSearchKeyword,
} from "~/engine.server";
import { prisma } from "~/prisma.server";
import { generateText } from "ai";
import { isAddress } from "viem";

export async function loader(ctx: LoaderFunctionArgs) {
	const queryId = ctx.params.queryId as string;

	// Fetch the query from database
	const query = await prisma.query.findUnique({
		where: {
			id: queryId,
		},
	});

	if (!query) {
		return redirect("/");
	}

	// If query has an answer already, return it directly
	if (query.answer) {
		return eventStream(ctx.request.signal, function setup(send) {
			send({
				data: JSON.stringify({
					content: query.answer,
				}),
			});

			return () => {};
		});
	}

	// If no answer, get info and analyze it
	const searchKeyword = await getSearchKeyword(query.query);
	const info = await getInfo(searchKeyword);

	if (!info) {
		return eventStream(ctx.request.signal, function setup(send) {
			send({
				data: JSON.stringify({
					error: "Unable to fetch information.",
				}),
			});

			return () => {};
		});
	}

	// Determine type based on keyword format
	let type: "evm" | "github_repo" | undefined;
	if (isAddress(searchKeyword) || searchKeyword.endsWith(".eth")) {
		type = "evm";
	} else if (searchKeyword.includes("/")) {
		type = "github_repo";
	} else {
		type = undefined;
	}

	// Analyze the information retrieved
	const analysis = await analyzeInfo(info, type);
	const context = `[[citation:0]] ${analysis}`;

	const model = openai("gpt-4o");

	return eventStream(ctx.request.signal, function setup(send) {
		async function run() {
			try {
				const result = await generateText({
					model,
					messages: [
						{
							role: "system",
							content: PROMPT(context),
						},
						{
							role: "user",
							content: query?.query || "",
						},
					],
					maxTokens: 4096,
				});

				if (result && typeof result === "object" && "text" in result) {
					send({
						data: JSON.stringify({
							content: result.text,
						}),
					});

					// Save the answer to database
					await prisma.query.update({
						where: {
							id: queryId,
						},
						data: {
							answer: result.text,
							keyword: searchKeyword,
						},
					});
				} else {
					console.error("Unexpected result format:", result);
					send({
						data: JSON.stringify({
							error: "An unexpected error occurred while processing the response.",
						}),
					});
				}
			} catch (error) {
				console.error("Error in run function:", error);
				send({
					data: JSON.stringify({
						error: "An unexpected error occurred.",
					}),
				});
			}
		}

		run();

		return () => {};
	});
}