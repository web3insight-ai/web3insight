import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import { env } from "@/env";

interface ShareRequestBody {
  share?: boolean;
}

const RPC_URL = `${env.DATA_API_URL}/rpc`;

export async function POST(
  request: Request,
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

    const body = (await request.json().catch(() => ({}))) as ShareRequestBody;
    const share = body.share ?? false;

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

    await client.custom.shareAnalysis({
      id: Number(analysisId),
      data: { share },
    });

    return Response.json(
      {
        success: true,
        code: "SUCCESS",
        message: share ? "Analysis shared publicly" : "Analysis made private",
        data: null,
      },
      { status: 200 },
    );
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
