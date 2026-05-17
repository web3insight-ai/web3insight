const COPILOT_BASE_PATH = "/copilot";

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

  const [sessionId] = pathname.slice(prefix.length).split("/");
  return sessionId || null;
}

function replaceCopilotPath(sessionId?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const targetPath = getCopilotPath(sessionId);
  if (window.location.pathname === targetPath) {
    return;
  }

  window.history.replaceState(window.history.state, "", targetPath);
}

function pushCopilotPath(sessionId?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const targetPath = getCopilotPath(sessionId);
  if (window.location.pathname === targetPath) {
    return;
  }

  window.history.pushState(window.history.state, "", targetPath);
}

export {
  COPILOT_BASE_PATH,
  getCopilotPath,
  getCopilotSessionIdFromPathname,
  pushCopilotPath,
  replaceCopilotPath,
};
