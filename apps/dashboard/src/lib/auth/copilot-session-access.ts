export type CopilotAccessLevel = "private" | "public";
export type CopilotViewerAccess = "full" | "read" | "none";

export interface ResolvedViewerAccess {
  // The session's own setting.
  accessLevel: CopilotAccessLevel;
  // Whether the current viewer owns the session.
  isOwner: boolean;
  // The viewer's effective permission: owners get "full", anyone may "read" a
  // public session, otherwise "none".
  viewerAccess: CopilotViewerAccess;
}

/**
 * Single source of truth for copilot session visibility. Callers fetch the
 * session's `access_level` + owner `user_id` (each route returns a different
 * body, so the DB read stays in the route) and pass them here so the
 * owner/public/none decision — and the resulting error code — is identical
 * across every session route.
 */
export function resolveViewerAccess(
  accessLevelRaw: string | null,
  ownerId: string | null,
  userId: string | null,
): ResolvedViewerAccess {
  const accessLevel: CopilotAccessLevel =
    accessLevelRaw === "public" ? "public" : "private";

  const isOwner = userId !== null && ownerId !== null && ownerId === userId;

  const viewerAccess: CopilotViewerAccess = isOwner
    ? "full"
    : accessLevel === "public"
      ? "read"
      : "none";

  return { accessLevel, isOwner, viewerAccess };
}
