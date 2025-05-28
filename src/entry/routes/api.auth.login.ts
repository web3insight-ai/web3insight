import { redirect, json } from "@remix-run/node";
import { pick } from "@/utils";

import { createUserSession } from "~/auth/helper/server-only";
import { signIn } from "~/auth/repository";

import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("POST", async ({ request }) => {
  const { identifier, password, redirectTo, clientSide } = await request.json();
  const res = await signIn({ identifier, password });

  if (!res.success) {
    return json({ ...res, data: undefined }, { status: Number(res.code) });
  }

  const { jwt, user } = res.data;
  const initOpts = await createUserSession({ request, userJwt: jwt, userId: user.id });

  return clientSide ? json({
    ...res,
    data: {
      user: pick(user, ["id", "username", "email"]),
    },
  }, initOpts) : redirect(redirectTo || "/", initOpts);
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction();
