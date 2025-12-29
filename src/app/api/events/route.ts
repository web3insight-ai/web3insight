import { NextRequest } from "next/server";
import { getSession } from "~/auth/helper/server";
import { api } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
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

    const url = new URL(request.url);
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const pageNum = Number(url.searchParams.get("pageNum")) || 1;

    const result = await api.custom.getAnalysisUserList(userToken, {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      direction: "desc",
    });

    if (!result.success) {
      return Response.json(result, { status: parseInt(result.code || "400") });
    }

    return Response.json({
      ...result,
      data: result.data.list,
      extra: { total: result.data.total },
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return Response.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const result = await api.custom.analyzeUserList(userToken, {
      request_data: data.urls,
      intent: "hackathon",
      description: data.description,
    });

    if (!result.success || !result.data) {
      return Response.json(result, { status: parseInt(result.code || "400") });
    }

    const { id, users, ...rest } = result.data;

    return Response.json({
      ...result,
      data: users,
      extra: { eventId: id, ...rest },
    });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return Response.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
