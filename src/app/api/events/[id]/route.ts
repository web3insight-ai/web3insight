import { NextRequest } from "next/server";
import { getSession } from "~/auth/helper/server";
import { api } from "@/lib/api/client";
import { resolveEventDetail } from "~/event/helper";
import type { DataValue } from "@/types";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  let idString = "unknown";
  try {
    const resolvedParams = await params;
    idString = resolvedParams.id;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return Response.json(
        { success: false, message: "Invalid event ID", code: "400" },
        { status: 400 },
      );
    }

    const session = await getSession();
    const userToken = session.get("userToken") as string | undefined as
      | string
      | undefined;

    if (!userToken) {
      return Response.json(
        { success: false, message: "Authentication required", code: "401" },
        { status: 401 },
      );
    }

    // Poll for data with retry logic
    let result = await api.custom.getAnalysisUser(userToken, id);
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
      result = await api.custom.getAnalysisUser(userToken, id);
      retryCount++;
    }

    if (!result.success) {
      return Response.json(result, { status: parseInt(result.code || "400") });
    }

    const eventReport = resolveEventDetail(
      result.data as Record<string, DataValue>,
    );

    return Response.json({
      ...result,
      data: eventReport,
    });
  } catch (error) {
    console.error(`GET /api/events/${idString} error:`, error);
    return Response.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  let idString = "unknown";
  try {
    const resolvedParams = await params;
    idString = resolvedParams.id;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return Response.json(
        { success: false, message: "Invalid event ID", code: "400" },
        { status: 400 },
      );
    }

    const session = await getSession();
    const userToken = session.get("userToken") as string | undefined as
      | string
      | undefined;

    if (!userToken) {
      return Response.json(
        { success: false, message: "Authentication required", code: "401" },
        { status: 401 },
      );
    }

    const data = await request.json();
    const result = await api.custom.updateAnalysisUser(userToken, id, {
      request_data: data.urls,
      intent: "hackathon",
      description: data.description,
    });

    if (!result.success || !result.data) {
      return Response.json(result, { status: parseInt(result.code || "400") });
    }

    const { id: eventId, users, ...rest } = result.data;

    return Response.json({
      ...result,
      data: users,
      extra: { eventId, ...rest },
    });
  } catch (error) {
    console.error(`PUT /api/events/${idString} error:`, error);
    return Response.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
