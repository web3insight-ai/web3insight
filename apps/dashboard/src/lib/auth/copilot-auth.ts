import "server-only";

import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { getSession } from "~/auth/helper/server";
import { env } from "@/env";

/**
 * Resolve the current user's ID from the auth cookie for copilot session scoping.
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

    const { client } = createWeb3InsightClient({
      url: `${env.DATA_API_URL}/rpc`,
      token: userToken,
      credentials: "omit",
    });

    const me = (await client.auth.me({})) as {
      user_id?: string | number;
      id?: string | number;
    };

    const id = me.user_id ?? me.id;
    return id != null ? String(id) : null;
  } catch {
    return null;
  }
}
