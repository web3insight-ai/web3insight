import { pick } from "@/utils";
import { fetchCurrentUser } from "~/auth/repository";
import type { ApiUser } from "~/auth/typing";

export async function GET() {
  const result = await fetchCurrentUser();
  const { data, extra, ..._others } = result;
  const resolved: {
    data?: Partial<ApiUser>;
    extra: Record<string, unknown>;
    code?: string;
    success: boolean;
    message?: string;
  } = {
    success: result.success,
    message: result.message,
    data: undefined,
    extra: { ...(extra || {}), authenticated: !!data },
  };

  if (data) {
    // Return more user fields including role information
    resolved.data = pick(data, [
      "id",
      "username",
      "email",
      "confirmed",
      "avatar_url",
      "role", // Include role information
      "binds", // Include connected accounts
      "profile", // Include profile data
    ]);
  } else {
    resolved.code = "401";
  }

  return Response.json(resolved, { status: Number(resolved.code || "200") });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
