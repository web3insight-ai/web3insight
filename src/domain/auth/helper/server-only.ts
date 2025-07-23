import { createCookieSessionStorage } from "@remix-run/node";

import type { DataValue } from "@/types";
import { getVar } from "@/utils/env";

const sessionOptions: Record<string, DataValue> = {
  cookie: {
    name: "web3insights_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [getVar("SESSION_SECRET")],
    secure: process.env.NODE_ENV === "production",
  },
};

let sessionStorage = null as DataValue;

function ensureSessionStorageCreated() {
  if (sessionStorage) {
    return;
  }

  sessionStorage = createCookieSessionStorage(sessionOptions);
}

// Get the session from the request
async function getSession(request: Request) {
  ensureSessionStorageCreated();
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

async function clearSession(session: DataValue) {
  return sessionStorage.destroySession(session);
}

// Store user data in session
async function createUserSession({
  request,
  userToken,
  userId,
}: {
  request: Request;
  userToken: string;
  userId: string;
}) {
  const session = await getSession(request);
  session.set("userToken", userToken);
  session.set("userId", userId);

  const cookieHeader = await sessionStorage.commitSession(session);

  return {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  };
}

export { getSession, clearSession, createUserSession };
