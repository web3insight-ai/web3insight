import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import type { AnalysisRequest } from "~/profile-analysis/typing";
import { env } from "@/env";

export async function POST(request: Request) {
  try {
    // Parse request data
    const requestData = (await request.json()) as AnalysisRequest;

    // Validate request data
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

    // For profile analysis, try user authentication first, fallback to server token
    const userResult = await fetchCurrentUser(request);
    let authToken: string | undefined;

    if (userResult.success) {
      // Use user token if authenticated
      const session = await getSession(request);
      authToken = session.get("userToken");
    }

    // Fallback to server token for public profile analysis
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

    const baseUrl = env.DATA_API_URL;
    const apiUrl = `${baseUrl}/v1/custom/analysis/users`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
          data: null,
        },
        { status: response.status },
      );
    }

    const rawResponse = await response.json();

    return Response.json(rawResponse, { status: 200 });
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
