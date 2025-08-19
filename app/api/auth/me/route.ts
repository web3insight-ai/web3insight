import { pick } from "@/utils";
import { fetchCurrentUser } from "~/auth/repository";

export async function GET(request: Request) {
  const { data, extra, ...others } = await fetchCurrentUser(request);
  const resolved = { ...others, data, extra: { ...extra, authenticated: !!data } };

  if (data) {
    resolved.data = pick(data as Record<string, unknown>, ["id", "username", "email", "confirmed", "avatar_url"]) as Record<string, unknown>;
  } else {
    resolved.code = "401";
  }

  return Response.json(resolved, { status: Number(resolved.code) });
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
