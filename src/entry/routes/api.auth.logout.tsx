import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { logout } from "~/services/auth/session.server";

// Handle both GET and POST for logout
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Check for client-side request
  const url = new URL(request.url);
  const clientSide = url.searchParams.get('clientSide') === 'true';

  if (clientSide) {
    const cookieHeader = await logout(request, "/", true);
    return json({ success: true }, {
      headers: {
        "Set-Cookie": cookieHeader
      }
    });
  }

  return logout(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Try to parse JSON body
    const contentType = request.headers.get("Content-Type");
    let clientSide = false;

    if (contentType && contentType.includes("application/json")) {
      const jsonData = await request.json();
      clientSide = jsonData.clientSide === true;
    } else {
      // Fall back to form data if not JSON
      const formData = await request.formData();
      clientSide = formData.get('clientSide') === 'true';
    }

    if (clientSide) {
      const cookieHeader = await logout(request, "/", true);
      return json({ success: true }, {
        headers: {
          "Set-Cookie": cookieHeader
        }
      });
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
  }

  // Default server-side logout with redirect
  return logout(request);
};