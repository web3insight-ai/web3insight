import { LoaderFunctionArgs, json } from "@remix-run/node";

import { pick } from "@/utils";

import { fetchCurrentUser } from "~/auth/repository";

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const { data, extra, ...others } = await fetchCurrentUser(request);
  const resolved = { ...others, data, extra: { ...extra, authenticated: !!data } };

  if (data) {
    resolved.data = pick(data, ["id", "username", "email", "confirmed"]);
  } else {
    resolved.code = "401";
  }

  return json(resolved, { status: Number(resolved.code) });
}
