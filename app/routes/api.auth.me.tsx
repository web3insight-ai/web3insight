import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getUser } from "~/services/auth/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const userData = await getUser(request);

    if (!userData) {
      return json({ authenticated: false, user: null }, { status: 401 });
    }

    // Return user data without sensitive information
    return json({
      authenticated: true,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        confirmed: userData.confirmed,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return json(
      { error: "An error occurred while fetching user data" },
      { status: 500 }
    );
  }
};