import { ActionFunctionArgs, json } from "@remix-run/node";
import { changePassword } from "#/services/auth/strapi.server";
import { getJwt } from "#/services/auth/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Get the current user's JWT from the session
    const token = await getJwt(request);
    if (!token) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword, password, passwordConfirmation } = body;

    // Validate inputs
    if (!currentPassword) {
      return json({ error: "Current password is required" }, { status: 400 });
    }

    if (!password) {
      return json({ error: "New password is required" }, { status: 400 });
    }

    if (!passwordConfirmation) {
      return json({ error: "Password confirmation is required" }, { status: 400 });
    }

    if (password !== passwordConfirmation) {
      return json({ error: "New passwords do not match" }, { status: 400 });
    }

    // Call Strapi change password service
    return await changePassword(currentPassword, password, passwordConfirmation, token);
  } catch (error) {
    console.error("Password change error:", error);
    return json({ error: "An error occurred during password change" }, { status: 500 });
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
