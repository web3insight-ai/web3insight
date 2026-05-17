import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import { env } from "@/env";

const RPC_URL = `${env.DATA_API_URL}/rpc`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  try {
    const analysisId = resolvedParams.id;

    if (!analysisId) {
      return Response.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "Analysis ID is required",
          data: null,
        },
        { status: 400 },
      );
    }

    // Reason: same as POST /api/analysis/users — prefer user JWT, fall back
    // to server token for shared/public analyses.
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

    // Reason: dashboard's fetchAnalysisResult + ProfileHeader read fields
    // (id, public, intent, github, …) directly off the response body. The
    // legacy NestJS endpoint returned the raw row, so do the same here.
    const detail = await client.custom.getAnalysis({
      id: Number(analysisId),
    });

    return Response.json(detail, { status: 200 });
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
