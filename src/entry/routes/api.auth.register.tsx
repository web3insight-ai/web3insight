import { ActionFunctionArgs, json } from "@remix-run/node";
import { registerUser } from "~/strapi/repository";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { username, email, password, passwordConfirm } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== passwordConfirm) {
      return json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Basic validation
    if (username.length < 3) {
      return json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Call Strapi registration service
    const response = await registerUser(username, email, password);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return json(
      { error: "An error occurred during registration" },
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
