const COPILOT_BASE_PATH = "/copilot";

// Reason: Session ids are UUIDs minted by POST /api/ai/sessions, so refuse to
// treat any other path segment (e.g. /copilot/share, /copilot/foo) as one.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidCopilotSessionId(candidate: string | undefined): boolean {
  return typeof candidate === "string" && UUID_REGEX.test(candidate);
}

function getCopilotPath(sessionId?: string | null): string {
  if (!sessionId) {
    return COPILOT_BASE_PATH;
  }

  return `${COPILOT_BASE_PATH}/${sessionId}`;
}

function getCopilotSessionIdFromPathname(pathname: string): string | null {
  if (pathname === COPILOT_BASE_PATH || pathname === `${COPILOT_BASE_PATH}/`) {
    return null;
  }

  const prefix = `${COPILOT_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const [sessionIdCandidate] = pathname.slice(prefix.length).split("/");
  return isValidCopilotSessionId(sessionIdCandidate)
    ? sessionIdCandidate
    : null;
}

// Reason: Use shallow History-API routing so Next.js' route transition does
// not flash a skeleton in the chat shell while the user switches sessions.
function replaceCopilotPath(sessionId?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const targetPath = getCopilotPath(sessionId);
  if (window.location.pathname === targetPath) {
    return;
  }

  // Reason: Pass a neutral state so Next.js can manage its own internal route
  // state. Reusing window.history.state retains stale payload (e.g. the
  // previous session id) and snaps the address bar back on subsequent renders.
  window.history.replaceState(null, "", targetPath);
}

function pushCopilotPath(sessionId?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const targetPath = getCopilotPath(sessionId);
  if (window.location.pathname === targetPath) {
    return;
  }

  window.history.pushState(null, "", targetPath);
}

export {
  COPILOT_BASE_PATH,
  getCopilotPath,
  getCopilotSessionIdFromPathname,
  isValidCopilotSessionId,
  pushCopilotPath,
  replaceCopilotPath,
};
