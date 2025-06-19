import { type ActionFunctionArgs, json } from "@remix-run/node";

import type { DataValue } from "@/types";
import { isString } from "@/utils";
import { generateFailedResponse } from "@/clients/http";

import type { RequestMethod, AllowedMethods, RepositoryService, RepositoryServiceMap, RepositoryServiceAdapter } from "./typing";

const notAllowedMessage = "Method not allowed";
const notAllowedStatus = 405;

function createServerAction<
  ReturnType,
  ActionContext extends ActionFunctionArgs = ActionFunctionArgs
>(
  allowedMethods: AllowedMethods,
  handler: (ctx: ActionContext) => ReturnType | Promise<ReturnType>,
  normalize: boolean = false,
): (ctx: ActionContext) => Promise<ReturnType> {
  return async (ctx: ActionContext) => {
    let methodValid = false;

    if (!allowedMethods || allowedMethods === "*") {
      methodValid = true;
    } else {
      methodValid = ([] as RequestMethod[]).concat(allowedMethods).includes(ctx.request.method as RequestMethod);
    }

    if (methodValid) {
      return handler(ctx);
    }

    const responseData = normalize ? generateFailedResponse(notAllowedMessage, notAllowedStatus) : { error: notAllowedMessage };

    return json(responseData, { status: notAllowedStatus }) as ReturnType;
  };
}

function generatePreflightResponse(allowedMethods: AllowedMethods) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": ([] as AllowedMethods[]).concat(allowedMethods).join(", "),
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function createPreflightAction(allowedMethods: AllowedMethods = ["POST", "OPTIONS"], normalize?: boolean) {
  return createServerAction("OPTIONS", generatePreflightResponse.bind(null, allowedMethods), normalize);
}

function createServiceAdapter(method: RequestMethod, service: RepositoryService): RepositoryServiceAdapter;
function createServiceAdapter(serviceMap: RepositoryServiceMap): RepositoryServiceAdapter;
function createServiceAdapter(
  methodOrServices: RequestMethod | RepositoryServiceMap,
  service?: RepositoryService,
): RepositoryServiceAdapter {
  const resolvedMap = (isString(methodOrServices) ? {
    [methodOrServices as RequestMethod]: service!,
  } : methodOrServices) as RepositoryServiceMap;
  const allMethods = (Object.keys(resolvedMap) as RequestMethod[]);

  const mutableMethods: RequestMethod[] = [];
  const immutableMethods: RequestMethod[] = [];

  allMethods.forEach(key => {
    if (["POST", "PUT"].includes(key)) {
      mutableMethods.push(key);
    } else {
      immutableMethods.push(key);
    }
  });

  const adapters: RepositoryServiceAdapter = {
    loader: createServerAction(allMethods, async ({ request }) => {
      const method = request.method as RequestMethod;

      if (method === "OPTIONS") {
        return generatePreflightResponse(allMethods);
      }

      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams.entries());
      const res = await resolvedMap[method]!(params as DataValue);
    
      return json(res, { status: Number(res.code) });
    }, true),
  };

  if (mutableMethods.length > 0) {
    adapters.action = createServerAction(mutableMethods, async ({ request }) => {
      const data = await request.json();

      return resolvedMap[request.method as RequestMethod]!(data);
    }, true);
  }

  return adapters;
}

export { createServerAction, createPreflightAction, createServiceAdapter };
