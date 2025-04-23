import { json } from "@remix-run/node";
import { changePassword } from "~/auth/repository";
import { getJwt } from "#/services/auth/session.server";

import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("POST", async ({ request }) => {
  // Get the current user's JWT from the session
  const token = await getJwt(request);
  const body = await request.json();
  const res = await changePassword({ token, ...body });

  return res.success ? res : json({ error: res.message }, { status: Number(res.code) });
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction();
