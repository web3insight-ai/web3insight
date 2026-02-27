import "server-only";

import { getSession } from "~/auth/helper/server";
import { env } from "@/env";

/**
 * Resolve the current user's ID from the auth cookie for copilot session scoping.
 *
 * Reason: We call the backend /v1/auth/user endpoint directly (instead of
 * reusing fetchCurrentUser) to keep this lightweight — we only need the
 * user_id string, not the full ApiUser transform. Next.js fetch cache
 * with 60s revalidation avoids repeated network calls per request.
 *
 * Returns null for anonymous (unauthenticated) users.
 */
export async function getCopilotUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    const userToken = session.get("userToken") as string | undefined;

    if (!userToken) {
      return null;
    }

    const response = await fetch(`${env.DATA_API_URL}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        accept: "*/*",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const userData = (await response.json()) as {
      profile?: { user_id?: string };
    };

    return userData.profile?.user_id ?? null;
  } catch {
    return null;
  }
}
