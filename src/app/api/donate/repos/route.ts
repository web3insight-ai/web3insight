import { NextResponse } from "next/server";
import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import { env } from "@/env";

/**
 * POST /api/donate/repos
 * Submit a repository for donation
 * Requires authentication with GitHub linked
 */
export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const userResult = await fetchCurrentUser();

    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Authentication required",
          data: null,
        },
        { status: 401 },
      );
    }

    // Get user token from session
    const session = await getSession();
    const userToken = session.get("userToken") as string | undefined;

    if (!userToken) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "No authentication token found",
          data: null,
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { repo_full_name } = body;

    if (!repo_full_name) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "repo_full_name is required",
          data: null,
        },
        { status: 400 },
      );
    }

    // Validate repo name format (owner/repo)
    const repoNameRegex = /^[\w.-]+\/[\w.-]+$/;
    if (!repoNameRegex.test(repo_full_name)) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "Invalid repository format. Expected: owner/repo",
          data: null,
        },
        { status: 400 },
      );
    }

    // Forward request to backend API
    const apiUrl = `${env.DATA_API_URL}/v1/donate/repos`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ repo_full_name }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API] Donate repo error:", error);
    return NextResponse.json(
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

/**
 * GET /api/donate/repos
 * List all donate repos (public)
 */
export async function GET() {
  try {
    const apiUrl = `${env.DATA_API_URL}/v1/donate/repos`;

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.DATA_API_TOKEN}`,
      },
      // Reason: Disable Next.js caching to ensure fresh data on every request
      cache: "no-store",
    });

    const data = await response.json();

    // Reason: Add cache-control headers to prevent browser/CDN caching of stale data
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[API] List donate repos error:", error);
    return NextResponse.json(
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
