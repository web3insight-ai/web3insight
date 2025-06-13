import { updateManager } from "~/admin/repository";

import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("PUT", async ({ request }) => {
  const data = await request.json();

  return updateManager(data);
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction(["PUT", "OPTIONS"]);
