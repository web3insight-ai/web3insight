import { NextResponse } from "next/server";
import { env } from "@/env";

/**
 * GET /api/donate/repos/[id]
 * Get a single donate repo by ID
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

    const apiUrl = `${env.DATA_API_URL}/v1/donate/repos/${id}`;

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.DATA_API_TOKEN}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API] Get donate repo by ID error:", error);
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
