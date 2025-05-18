import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";

import { noop } from "@/utils";

import { generateText, getSearchKeyword, fetchAnalysisPrompt } from "~/ai/repository";
import { fetchOne, updateOne } from "~/query/repository";
import { getInfo } from "~/ecosystem/repository";

export async function loader(ctx: LoaderFunctionArgs) {
  const queryId = ctx.params.queryId as string;

  // Fetch the query from Strapi
  const { success, data: query } = await fetchOne(queryId);

  if (!success || !query) {
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

      return noop;
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

      return noop;
    });
  }

  // Analyze the information retrieved
  const analysisPrompt = await fetchAnalysisPrompt(info, searchKeyword);

  return eventStream(ctx.request.signal, function setup(send) {
    async function run() {
      try {
        const result = await generateText({
          messages: [
            {
              role: "system",
              content: analysisPrompt,
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

          // Save the answer to Strapi
          await updateOne(queryId, {
            answer: result.text,
            keyboard: searchKeyword, // Note: keyboard is used instead of keyword in Strapi schema
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

    return noop;
  });
}
