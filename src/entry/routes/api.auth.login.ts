import { json } from "@remix-run/node";
import { signIn } from "~/auth/repository";
import { createUserSession } from "#/services/auth/session.server";
import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("POST", async ({ request }) => {
  const { identifier, password, redirectTo, clientSide } = await request.json();
  const res = await signIn({ identifier, password });

  if (!res.success) {
    return json({ error: res.message }, { status: Number(res.code) });
  }

  const loginData = res.data;

  // If this is a client-side request, just return success without redirect
  if (clientSide) {
    const cookieHeader = await createUserSession({
      request,
      userJwt: loginData.jwt,
      userId: loginData.user.id,
      redirectTo: '/',
      returnCookieHeader: true
    });

    return json({
      success: true,
      user: {
        id: loginData.user.id,
        username: loginData.user.username,
        email: loginData.user.email
      }
    }, {
      headers: {
        "Set-Cookie": <string>cookieHeader
      }
    });
  }

  // Otherwise, create session with redirect
  return createUserSession({
    request,
    userJwt: loginData.jwt,
    userId: loginData.user.id,
    redirectTo: redirectTo || "/"
  });
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction();
