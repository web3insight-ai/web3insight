import { NextResponse } from "next/server";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { api } from "@/lib/api/client";

export async function GET(request: Request) {
  try {
    const res = await fetchCurrentUser();

    if (!canManageEcosystems(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const result = await api.ecosystems.updateRepoCustomMark({
      id: Number(params.id),
      eco: params.eco as string,
      mark: Number(params.mark),
    });

    return NextResponse.json(result, { status: Number(result.code) || 200 });
  } catch (error) {
    console.error("Error in ecosystem repos mark GET:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const res = await fetchCurrentUser();

    if (!canManageEcosystems(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const data = await request.json();
    const result = await api.ecosystems.updateRepoCustomMark({
      id: Number(data.id),
      eco: data.eco as string,
      mark: Number(data.mark),
    });

    return NextResponse.json(result, { status: Number(result.code) || 200 });
  } catch (error) {
    console.error("Error in ecosystem repos mark PUT:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
