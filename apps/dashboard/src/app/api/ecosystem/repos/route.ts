import { NextResponse } from "next/server";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { api } from "@/lib/api/client";
import type { Repository } from "~/repository/typing";

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

    const pageSize = params.pageSize ? Number(params.pageSize) : 20;
    const pageNum = params.pageNum ? Number(params.pageNum) : 1;
    const offset = (pageNum - 1) * pageSize;

    const result = await api.ecosystems.getAdminRepoList({
      eco: params.eco as string,
      offset,
      limit: pageSize,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: Number(result.code) || 500 });
    }

    // Transform to Repository[] format expected by client
    const repositories: Repository[] = result.data.list.map((item) => {
      const customMarkValue = item.custom_marks[params.eco as string];
      const customMark =
        typeof customMarkValue === "number" ||
        typeof customMarkValue === "string"
          ? customMarkValue
          : -1;

      return {
        id: item.repo_id,
        name: item.repo_name,
        fullName: item.repo_name,
        description: "",
        statistics: {
          star: -1,
          fork: -1,
          watch: -1,
          openIssue: -1,
          contributor: -1,
        },
        customMark,
      };
    });

    return NextResponse.json({
      success: true,
      data: repositories,
      message: "Success",
      code: "200",
      extra: { total: Number(result.data.total) || 0 },
    });
  } catch (error) {
    console.error("Error in ecosystem repos GET:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
