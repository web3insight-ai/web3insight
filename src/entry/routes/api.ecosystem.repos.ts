import { type LoaderFunctionArgs, json } from "@remix-run/node";

import type { DataValue } from "@/types";
import { generateFailedResponse } from "@/clients/http";

import { fetchManageableRepositoryList } from "~/ecosystem/repository";

async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  
  if (request.method !== "GET") {
    return json(generateFailedResponse("Method not allowed", 405), { status: 405 });
  }

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const res = await fetchManageableRepositoryList(params as DataValue);

  return json(res, { status: Number(res.code) });
}

export { loader };
