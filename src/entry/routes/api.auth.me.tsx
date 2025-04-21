import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getUser } from "~/services/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
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
    // Get the current user from the session
    const user = await getUser(request);

    if (!user) {
      return json({ authenticated: false }, { status: 401 });
    }

    return json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        confirmed: user.confirmed
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}