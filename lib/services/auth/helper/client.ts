// Client-safe auth helpers that don't use server-only APIs

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

// Client-safe session clearing (returns cookie clear string)
async function clearSession() {
  // Return a cookie header string that clears the session cookie
  return `web3insight_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { clearSession, MockSession };
export type { SessionData };
