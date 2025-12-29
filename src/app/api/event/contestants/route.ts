import { NextResponse } from "next/server";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEvents } from "~/auth/helper";
import { getSession } from "~/auth/helper/server";
import { api } from "@/lib/api/client";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const pageNum = Number(url.searchParams.get("pageNum")) || 1;

    const result = await api.custom.getAnalysisUserList(userToken, {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      direction: "desc",
    });

    if (!result.success) {
      return NextResponse.json(result, { status: Number(result.code) || 500 });
    }

    return NextResponse.json({
      ...result,
      data: result.data.list,
      extra: { total: result.data.total },
    });
  } catch (error) {
    console.error("Error in event contestants GET:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

    const data = await request.json();
    const result = await api.custom.analyzeUserList(userToken, {
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
    console.error("Error in event contestants POST:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
