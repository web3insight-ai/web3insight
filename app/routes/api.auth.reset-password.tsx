import { ActionFunctionArgs, json } from "@remix-run/node";
import { resetPassword } from "~/services/auth/strapi.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { code, password, passwordConfirmation } = body;

    if (!code || !password || !passwordConfirmation) {
      return json(
        { error: "Reset code and new password are required" },
        { status: 400 }
      );
    }

    if (password !== passwordConfirmation) {
      return json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Call Strapi password reset service
    return resetPassword(code, password, passwordConfirmation);
  } catch (error) {
    console.error("Password reset error:", error);
    return json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
};

// For preflight requests (important for CORS)
export const loader = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};