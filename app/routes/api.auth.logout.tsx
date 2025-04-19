import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { logout } from "~/services/auth/session.server";

// Handle both GET and POST for logout
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  return logout(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return logout(request);
};