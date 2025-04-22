import { createCookieSessionStorage, redirect } from "@remix-run/node";
import type { StrapiUser } from "@/types";
import { getCurrentUser } from "./strapi.server";

// Cookie session configuration
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "web3insights_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "default-secret-change-me"],
    secure: process.env.NODE_ENV === "production",
  },
});

// Simple in-memory cache for user data
// This will reduce repeated API calls within the same server instance
type UserCache = {
  [key: string]: {
    user: StrapiUser;
    timestamp: number;
  };
};

const userCache: UserCache = {};
const CACHE_TTL = 60 * 1000; // 60 seconds cache TTL

// Session data types
export interface SessionData {
  userJwt?: string;
  userId?: number;
}

// Get the session from the request
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// Store user data in session
export async function createUserSession({
  request,
  userJwt,
  userId,
  redirectTo,
  returnCookieHeader = false,
}: {
  request: Request;
  userJwt: string;
  userId: number;
  redirectTo: string;
  returnCookieHeader?: boolean;
}) {
  const session = await getSession(request);
  session.set("userJwt", userJwt);
  session.set("userId", userId);

  const cookieHeader = await sessionStorage.commitSession(session);

  // If returnCookieHeader flag is true, return just the cookie header
  if (returnCookieHeader) {
    return cookieHeader;
  }

  // Otherwise return redirect response with cookie header
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
}

// Get the authenticated user from the session
export async function getUser(request: Request): Promise<StrapiUser | null> {
  const session = await getSession(request);
  const userJwt = session.get("userJwt");

  // If there's no JWT, user is not authenticated
  if (!userJwt) return null;

  // Check cache first
  const now = Date.now();
  const cachedData = userCache[userJwt];
  if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.user;
  }

  try {
    // Fetch current user data from Strapi using the JWT
    const userData = await getCurrentUser(userJwt);

    // Check if userData is valid and not an error response
    if (userData && !userData.error && userData.id) {
      // Cache the result
      userCache[userJwt] = {
        user: userData,
        timestamp: now
      };
      return userData;
    }

    // If we couldn't get valid user data, return null
    return null;
  } catch (error) {
    return null;
  }
}

// Check if the user is authenticated
export async function requireUser(request: Request, redirectTo: string = "/") {
  const user = await getUser(request);
  if (!user) {
    throw redirect(redirectTo);
  }
  return user;
}

// Log the user out
export async function logout(
  request: Request,
  redirectTo: string = "/",
  returnCookieHeader: boolean = false
): Promise<Response | string> {
  const session = await getSession(request);
  const userJwt = session.get("userJwt");

  // Clear from cache if exists
  if (userJwt && userCache[userJwt]) {
    delete userCache[userJwt];
  }

  // Clear the session
  const cookieHeader = await sessionStorage.destroySession(session);

  // For client-side requests, just return the cookie header
  if (returnCookieHeader) {
    return cookieHeader;
  }

  // For server-side requests, redirect
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
}

// Get session data
export async function getSessionData(request: Request): Promise<SessionData> {
  const session = await getSession(request);
  return {
    userJwt: session.get("userJwt"),
    userId: session.get("userId"),
  };
}

// Get JWT token from session
export async function getJwt(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get("userJwt") || null;
}
