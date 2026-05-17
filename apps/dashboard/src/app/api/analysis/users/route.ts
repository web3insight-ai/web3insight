import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import type { AnalysisRequest } from "~/profile-analysis/typing";
import { env } from "@/env";

const RPC_URL = `${env.DATA_API_URL}/rpc`;

export async function POST(request: Request) {
  try {
    const requestData = (await request.json()) as AnalysisRequest;

    if (!requestData.intent) {
      return Response.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "Intent is required",
          data: null,
        },
        { status: 400 },
      );
    }

    // Reason: profile analysis is usable both logged-in and anonymously —
    // prefer the user's JWT so saved analyses bind to their account, fall
    // back to the server token so public submissions still hit the backend.
    const userResult = await fetchCurrentUser();
    let authToken: string | undefined;

    if (userResult.success) {
      const session = await getSession();
      authToken = session.get("userToken") as string | undefined;
    }

    if (!authToken) {
      authToken = env.DATA_API_TOKEN;
    }

    if (!authToken) {
      return Response.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "No authentication token available",
          data: null,
        },
        { status: 401 },
      );
    }

    const { client } = createWeb3InsightClient({
      url: RPC_URL,
      token: authToken,
      credentials: "omit",
    });

    // Reason: dashboard's analyzeUser reads `rawResult.id` directly off the
    // response body — the legacy NestJS endpoint returned the raw shape, so
    // pass the orpc result through without an envelope to keep that contract.
    const result = await client.custom.createAnalysis(requestData as never);

    return Response.json(result, { status: 200 });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        success: false,
        code: `HTTP_${status}`,
        message,
        data: null,
      },
      { status },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
