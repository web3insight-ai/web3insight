import { NextResponse } from "next/server";
import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { env } from "@/env";

const RPC_URL = `${env.DATA_API_URL}/rpc`;

/**
 * GET /api/donate/repos/[id] — fetch a single donate repo by id.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "Repository ID is required",
          data: null,
        },
        { status: 400 },
      );
    }

    const { client } = createWeb3InsightClient({
      url: RPC_URL,
      token: env.DATA_API_TOKEN,
      credentials: "omit",
    });

    const detail = await client.donate.getDonationById({ id: Number(id) });

    return NextResponse.json({
      success: true,
      code: "200",
      message: "",
      data: detail,
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Get donate repo by ID error:", error);
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
