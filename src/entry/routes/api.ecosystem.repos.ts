import { type LoaderFunctionArgs, json } from "@remix-run/node";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { fetchManageableRepositoryList } from "~/ecosystem/repository";

async function protectedLoader(args: LoaderFunctionArgs) {
  const res = await fetchCurrentUser(args.request);
  
  if (!canManageEcosystems(res.data)) {
    return json({ success: false, message: "Access denied", code: "404" }, { status: 404 });
  }

  const url = new URL(args.request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const result = await fetchManageableRepositoryList(params);
  
  return json(result, { status: Number(result.code) });
}

export { protectedLoader as loader };
