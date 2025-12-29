import { NextResponse } from "next/server";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEvents } from "~/auth/helper";
import { getSession } from "~/auth/helper/server";
import { api } from "@/lib/api/client";
import { resolveEventDetail } from "~/event/helper";
import type { DataValue } from "@/types";

interface Params {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const res = await fetchCurrentUser();

    if (!canManageEvents(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const session = await getSession();
    const userToken = session.get("userToken") as string | undefined as
      | string
      | undefined;

    if (!userToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "401" },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const eventId = Number(resolvedParams.id);

    // Poll for data with retry logic
    let result = await api.custom.getAnalysisUser(userToken, eventId);
    let retryCount = 0;
    const maxRetries = 10;

    // Type for event data structure from API
    // The API returns data directly, not nested under another "data" key
    interface EventDataStructure {
      users?: Array<{
        ecosystem_scores?: unknown[];
      }>;
      data?: {
        users?: Array<{
          ecosystem_scores?: unknown[];
        }>;
      };
    }

    while (retryCount < maxRetries) {
      const eventData = result.data as EventDataStructure | undefined;
      // Check both possible structures: users at root level or under data.users
      const users = eventData?.users || eventData?.data?.users;
      const hasCompleteData =
        result.success &&
        Number(result.code) === 200 &&
        users &&
        Array.isArray(users) &&
        users.length > 0 &&
        users[0]?.ecosystem_scores &&
        Array.isArray(users[0].ecosystem_scores) &&
        users[0].ecosystem_scores.length > 0;

      if (hasCompleteData) break;

      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
      result = await api.custom.getAnalysisUser(userToken, eventId);
      retryCount++;
    }

    if (!result.success) {
      return NextResponse.json(result, { status: Number(result.code) || 500 });
    }

    const eventReport = resolveEventDetail(
      result.data as Record<string, DataValue>,
    );

    return NextResponse.json({
      ...result,
      data: eventReport,
    });
  } catch (error) {
    console.error("Error in event contestants by ID GET:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const res = await fetchCurrentUser();

    if (!canManageEvents(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const session = await getSession();
    const userToken = session.get("userToken") as string | undefined as
      | string
      | undefined;

    if (!userToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "401" },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const eventId = Number(resolvedParams.id);
    const data = await request.json();

    const result = await api.custom.updateAnalysisUser(userToken, eventId, {
      request_data: data.urls,
      intent: "hackathon",
      description: data.description,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(result, { status: Number(result.code) || 500 });
    }

    const { id, users, ...rest } = result.data;

    return NextResponse.json({
      ...result,
      data: users,
      extra: { eventId: id, ...rest },
    });
  } catch (error) {
    console.error("Error in event contestants by ID PUT:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
