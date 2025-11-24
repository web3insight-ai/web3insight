import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { env } from "@/env";

const secret = new TextEncoder().encode(
  env.SESSION_SECRET || "fallback-secret-key",
);
const alg = "HS256";

interface SessionData {
  userToken?: string;
  userId?: string;
  [key: string]: unknown;
}

class MockSession {
  private data: SessionData = {};

  set(key: string, value: unknown) {
    this.data[key] = value;
  }

  get(key: string) {
    return this.data[key];
  }

  unset(key: string) {
    delete this.data[key];
  }

  has(key: string) {
    return key in this.data;
  }

  getData() {
    return this.data;
  }

  setData(data: SessionData) {
    this.data = data;
  }
}

// Server-only function - uses cookies()
async function getSession(): Promise<MockSession> {
  const session = new MockSession();

  try {
    const cookieStore = await cookies();

    // First try to get the new auth-token (from Privy login)
    const authTokenCookie = cookieStore.get("auth-token");
    if (authTokenCookie?.value) {
      // Store the token directly in session
      session.setData({ userToken: authTokenCookie.value, userId: "" });
      return session;
    }

    // Fallback to old session cookie (for backwards compatibility with GitHub login)
    const sessionCookie = cookieStore.get("web3insight_session");
    if (sessionCookie?.value) {
      const { payload } = await jwtVerify(sessionCookie.value, secret);
      session.setData(payload as SessionData);
    }
  } catch (error) {
    // If JWT verification fails, return empty session
    console.warn("Session verification failed:", error);
  }

  return session;
}

// Server-only function - creates session tokens
async function createUserSession({
  userToken,
  userId,
}: {
  userToken: string;
  userId: string;
}) {
  const sessionData: SessionData = {
    userToken,
    userId,
  };

  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return {
    headers: {
      "Set-Cookie": `web3insight_session=${token}; Path=/; HttpOnly; SameSite=Lax; ${
        env.NODE_ENV === "production" ? "Secure;" : ""
      } Max-Age=86400`,
    },
  };
}

// Server-only function - clears session cookies
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function clearSession(_session?: MockSession) {
  const cookieStore = await cookies();

  // Clear both cookies
  cookieStore.delete("auth-token");
  cookieStore.delete("web3insight_session");

  // Return a cookie header string that clears the session cookie (for backwards compatibility)
  return `web3insight_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { getSession, createUserSession, clearSession, MockSession };
export type { SessionData };
