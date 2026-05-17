import { NextResponse } from "next/server";
import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";
import { env } from "@/env";

const RPC_URL = `${env.DATA_API_URL}/rpc`;

/**
 * POST /api/donate/repos — submit a repo for donation listing.
 * Requires an authenticated user; forwards to orpc.donate.createDonation.
 */
export async function POST(request: Request) {
  try {
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

    const { client } = createWeb3InsightClient({
      url: RPC_URL,
      token: userToken,
      credentials: "omit",
    });

    const created = await client.donate.createDonation({ repo_full_name });

    return NextResponse.json({
      success: true,
      code: "200",
      message: "",
      data: created,
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Donate repo error:", error);
    return NextResponse.json(
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

/**
 * GET /api/donate/repos — list all donate repos (public).
 */
export async function GET() {
  try {
    const { client } = createWeb3InsightClient({
      url: RPC_URL,
      token: env.DATA_API_TOKEN,
      credentials: "omit",
    });

    const list = await client.donate.listDonations();

    return NextResponse.json(
      { success: true, code: "200", message: "", data: list },
      {
        // Reason: keep parity with previous handler — prevent CDN/browser
        // caching since donations change frequently and stale lists confuse
        // contributors checking their submission.
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] List donate repos error:", error);
    return NextResponse.json(
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
