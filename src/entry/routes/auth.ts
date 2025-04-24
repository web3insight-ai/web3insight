import { type ActionFunctionArgs, redirect, json } from "@remix-run/node";

import type { ResponseResult } from "@/types";
import { omit } from "@/utils";
import { generateFailedResponse } from "@/clients/http";

import { createUserSession } from "~/auth/helper";
import { signUp, signIn, sendPasswordResetEmail, resetPassword } from "~/auth/repository";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  // Get the redirect URL (or default to home)
  const redirectTo = formData.get("redirectTo")?.toString() || "/";
  const resolveResponse = async (result: ResponseResult) => {
    if (result.success) {
      const initOpts = await createUserSession({
        request,
        userJwt: result.data.jwt,
        userId: result.data.user.id,
      });

      return redirect(redirectTo, initOpts);
    }

    return json(omit(result, ["data"]));
  };

  try {
    // Handle different auth actions
    switch (action) {
      case "signin": {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await signIn({ identifier: email, password});

        return resolveResponse(res);
      }

      case "signup": {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const username = formData.get("username") as string;

        const res = await signUp({ username, email, password, passwordConfirm: password });

        return resolveResponse(res);
      }

      case "forgotPassword": {
        const email = formData.get("email") as string;
        const { extra, ...others } = await sendPasswordResetEmail(email);

        return json({
          ...others,
          extra: { ...extra, resetSuccess: true, email },
        });
      }

      case "resetPassword": {
        const code = formData.get("code") as string;
        const password = formData.get("password") as string;
        const passwordConfirmation = formData.get("passwordConfirmation") as string;

        const res = await resetPassword({ code, password, passwordConfirmation });

        return resolveResponse(res);
      }

      default:
        return json(generateFailedResponse("Invalid action", 400), { status: 400 });
    }
  } catch (error) {
    console.error("Auth action error:", error);
    return json(generateFailedResponse("An unexpected error occurred"), { status: 500 });
  }
}

// No loader or component needed for this route
export default function Auth() {
  return redirect("/");
}
