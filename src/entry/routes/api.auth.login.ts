import { redirect, json } from "@remix-run/node";
import { pick } from "@/utils";

import { createUserSession } from "~/auth/helper/server-only";
import { signInWithGitHub } from "~/auth/repository";

import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("POST", async ({ request }) => {
  const { code, redirectTo, clientSide } = await request.json();
  const res = await signInWithGitHub(code);

  if (!res.success) {
    return json({ ...res, data: undefined }, { status: Number(res.code) });
  }

  const { token, user } = res.data;
  const initOpts = await createUserSession({ request, userToken: token, userId: user.id });

  return clientSide ? json({
    ...res,
    data: {
      user: pick(user, ["id", "username", "email", "avatar_url"]),
    },
  }, initOpts) : redirect(redirectTo || "/", initOpts);
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction();
