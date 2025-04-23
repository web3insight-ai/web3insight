import { json } from "@remix-run/node";
import { resetPassword } from "~/auth/repository";

import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("POST", async ({ request }) => {
  const body = await request.json();
  const res = await resetPassword(body);

  return res.success ? res : json({ error: res.message }, { status: Number(res.code) });
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction();
