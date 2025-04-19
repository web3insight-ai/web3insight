import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getCurrentUser } from "./strapi.server";

// Session storage configuration
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "web3insights_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

// Create a session with user details
export async function createUserSession(userId: string, jwt: string, redirectTo: string) {
  console.log("Creating session for user:", userId);
  console.log("Redirecting to:", redirectTo);

  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  session.set("jwt", jwt);

  const cookie = await sessionStorage.commitSession(session);
  console.log("Session cookie created");

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

// Get user session
export async function getUserSession(request: Request) {
  try {
    return sessionStorage.getSession(request.headers.get("Cookie"));
  } catch (error) {
    console.error("Error getting user session:", error);
    // Return an empty session if there's an error
    return sessionStorage.getSession();
  }
}

// Get JWT from session
export async function getJwt(request: Request) {
  try {
    const session = await getUserSession(request);
    const jwt = session.get("jwt");

    if (!jwt) {
      console.log("No JWT found in session");
      return null;
    }

    return jwt;
  } catch (error) {
    console.error("Error getting JWT from session:", error);
    return null;
  }
}

// Get user details from session
export async function getUserDetails(request: Request) {
  try {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    const jwt = session.get("jwt");

    if (!userId || !jwt) {
      console.log("No user details in session");
      return null;
    }

    return { userId, jwt };
  } catch (error) {
    console.error("Error getting user details:", error);
    return null;
  }
}

// Get logged in user
export async function getUser(request: Request) {
  try {
    const userDetails = await getUserDetails(request);

    if (!userDetails) {
      console.log("getUser: No user details found in session");
      return null;
    }

    try {
      const userData = await getCurrentUser(userDetails.jwt);

      // Check if the response indicates an error
      if (userData.error || (userData.status && userData.status !== 200)) {
        console.error("getUser: Failed to get user data:", userData.error || "Unknown error");

        // If we can't get the user data, the session might be invalid
        // Consider clearing the session in this case
        if (userData.status === 401) {
          console.log("getUser: User is not authenticated, clearing session");
          const session = await getUserSession(request);
          return redirect("/auth/login", {
            headers: {
              "Set-Cookie": await sessionStorage.destroySession(session)
            }
          });
        }

        return null;
      }
      return userData;
    } catch (error) {
      console.error("getUser: Error getting user data:", error);
      return null;
    }
  } catch (error) {
    console.error("getUser: Unexpected error:", error);
    return null;
  }
}

// Require authentication for a route
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userDetails = await getUserDetails(request);

  if (!userDetails) {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo],
    ]);
    throw redirect(`/auth/login?${searchParams}`);
  }

  return userDetails.userId;
}

// Logout user
export async function logout(request: Request) {
  const session = await getUserSession(request);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}