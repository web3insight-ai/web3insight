import { updateManageableRepositoryMark } from "~/ecosystem/repository";

import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("PUT", async ({ request }) => {
  const data = await request.json();

  return updateManageableRepositoryMark(data);
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction(["PUT", "OPTIONS"]);
