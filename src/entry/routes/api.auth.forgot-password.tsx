import { ActionFunctionArgs, json } from "@remix-run/node";
import { sendPasswordResetEmail } from "~/services/auth/strapi.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

    // Call Strapi password reset service
    return sendPasswordResetEmail(email);
  } catch (error) {
    console.error("Password reset request error:", error);
    return json(
      { error: "An error occurred while processing your request" },
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