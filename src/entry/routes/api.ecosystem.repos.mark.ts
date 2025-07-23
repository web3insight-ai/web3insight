import { type LoaderFunctionArgs, type ActionFunctionArgs, json } from "@remix-run/node";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { updateManageableRepositoryMark } from "~/ecosystem/repository";

async function protectedAction(args: ActionFunctionArgs) {
  const res = await fetchCurrentUser(args.request);
  
  if (!canManageEcosystems(res.data)) {
    return json({ success: false, message: "Access denied", code: "404" }, { status: 404 });
  }

  const data = await args.request.json();
  const result = await updateManageableRepositoryMark(data);
  
  return json(result, { status: Number(result.code) });
}

async function protectedLoader(args: LoaderFunctionArgs) {
  const res = await fetchCurrentUser(args.request);
  
  if (!canManageEcosystems(res.data)) {
    return json({ success: false, message: "Access denied", code: "404" }, { status: 404 });
  }

  const url = new URL(args.request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const result = await updateManageableRepositoryMark(params);
  
  return json(result, { status: Number(result.code) });
}

export { protectedAction as action, protectedLoader as loader };
