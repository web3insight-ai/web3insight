import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import { env } from "@/env";

const RPC_URL = `${env.DATA_API_URL}/rpc`;

// Reason: legacy event-analysis route shared the /custom/analysis/users/:id
// REST surface; orpc procedure `custom.getAnalysis` is the same backend
// lookup, so we reuse it here rather than introducing a separate procedure.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  try {
    const eventId = resolvedParams.id;

    if (!eventId) {
      return Response.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "Event ID is required",
          data: null,
        },
        { status: 400 },
      );
    }

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

    const detail = await client.custom.getAnalysis({ id: Number(eventId) });

    return Response.json(
      { success: true, code: "200", message: "", data: detail },
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
