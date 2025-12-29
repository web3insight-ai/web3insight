import { NextResponse } from "next/server";

import { api } from "@/lib/api/client";
import { resolveEventDetail } from "~/event/helper";
import type { DataValue } from "@/types";

interface Params {
  id: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const resolvedParams = await params;
    const eventId = Number(resolvedParams.id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID", code: "400", data: {} },
        { status: 400 },
      );
    }

    const result = await api.events.getPublicDetail(eventId);

    if (!result.success) {
      const statusCode = Number(result.code);
      const status = Number.isNaN(statusCode) ? 500 : statusCode;
      return NextResponse.json(result, { status });
    }

    const eventReport = resolveEventDetail(
      result.data as Record<string, DataValue>,
    );

    return NextResponse.json({
      ...result,
      data: eventReport,
    });
  } catch (error) {
    console.error("[API] GET /api/events/public/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        code: "500",
        data: {},
      },
      { status: 500 },
    );
  }
}
