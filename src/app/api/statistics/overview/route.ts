import { NextResponse } from "next/server";
import { fetchStatisticsOverview } from "~/statistics/repository";

export async function GET() {
  try {
    const result = await fetchStatisticsOverview();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || "Failed to fetch statistics overview",
        data: {
          ecosystem: 0,
          repository: 0,
          developer: 0,
          coreDeveloper: 0,
        },
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error fetching statistics overview:", error);

    return NextResponse.json({
      success: false,
      message: "Internal server error",
      data: {
        ecosystem: 0,
        repository: 0,
        developer: 0,
        coreDeveloper: 0,
      },
    }, { status: 500 });
  }
}
