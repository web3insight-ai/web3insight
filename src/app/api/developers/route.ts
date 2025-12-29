import { NextResponse } from "next/server";
import { api } from "@/lib/api/client";

export async function GET() {
  try {
    const result = await api.actors.getRankList();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: result.message || "Failed to fetch developers",
        data: { list: [] },
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("API Error fetching developers:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: { list: [] },
      },
      { status: 500 },
    );
  }
}
