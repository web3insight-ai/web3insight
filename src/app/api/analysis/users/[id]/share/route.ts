import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import { env } from "@/env";

interface ShareRequestBody {
  share?: boolean;
}

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

    const apiUrl = `${env.DATA_API_URL}/v1/custom/analysis/users/${analysisId}/share`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ share }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return Response.json(
        {
          success: false,
          code: `HTTP_${response.status}`,
          message:
            errorText || `HTTP ${response.status}: ${response.statusText}`,
          data: null,
        },
        { status: response.status },
      );
    }

    let data: unknown = null;
    if (response.status !== 204) {
      data = await response.json().catch(() => null);
    }

    return Response.json(
      {
        success: true,
        code: "SUCCESS",
        message: share ? "Analysis shared publicly" : "Analysis made private",
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        code: "API_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
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
