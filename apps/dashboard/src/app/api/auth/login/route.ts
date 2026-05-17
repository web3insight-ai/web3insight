// import { redirect } from "next/navigation"; // Will be used for server-side redirects
import { pick } from "@/utils";
import { createUserSession } from "~/auth/helper/server";
import { signInWithGitHub } from "~/auth/repository";

export async function POST(request: Request) {
  const { code, redirectTo, clientSide } = await request.json();
  const res = await signInWithGitHub(code);

  if (!res.success) {
    return Response.json(
      { ...res, data: undefined },
      { status: Number(res.code) },
    );
  }

  const { token, user } = res.data;
  if (!user || !user.id) {
    return Response.json(
      { success: false, message: "User data missing", data: undefined },
      { status: 500 },
    );
  }
  const initOpts = await createUserSession({
    userToken: token,
    userId: user.id,
  });

  if (clientSide) {
    return Response.json(
      {
        ...res,
        data: {
          user: user
            ? pick(user, ["id", "username", "email", "avatar_url"])
            : null,
        },
      },
      initOpts,
    );
  } else {
    // For server-side redirect, return the redirect response
    return new Response(null, {
      status: 302,
      headers: {
        ...initOpts.headers,
        Location: redirectTo || "/",
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
