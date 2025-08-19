import 'server-only';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

import { getVar } from "@/utils/env";

const secret = new TextEncoder().encode(getVar("SESSION_SECRET") || 'fallback-secret-key');
const alg = 'HS256';

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
    const sessionCookie = cookieStore.get('web3insight_session');

    if (sessionCookie?.value) {
      const { payload } = await jwtVerify(sessionCookie.value, secret);
      session.setData(payload as SessionData);
    }
  } catch (error) {
    // If JWT verification fails, return empty session
    console.warn('Session verification failed:', error);
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
    .setExpirationTime('24h')
    .sign(secret);

  return {
    headers: {
      "Set-Cookie": `web3insight_session=${token}; Path=/; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} Max-Age=86400`,
    },
  };
}

export { getSession, createUserSession, MockSession };
export type { SessionData };
