import { type ActionFunctionArgs, json } from "@remix-run/node";

import type { DataValue, ResponseResult } from "@/types";
import { generateFailedResponse } from "@/clients/http";

type RequestMethod = "OPTIONS" | "GET" | "POST" | "PUT" | "DELETE";
type AllowedMethods = RequestMethod | "*" | RequestMethod[];

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

function createServiceAdapter(
  method: RequestMethod,
  service: (...args: DataValue[]) => Promise<ResponseResult>,
) {
  if (["POST", "PUT"].includes(method)) {
    return {
      action: createServerAction(method, async ({ request }) => {
        const data = await request.json();

        return service(data);
      }, true),
      loader: createPreflightAction([method, "OPTIONS"], true),
    };
  }

  return {
    loader: createServerAction(method, async ({ request }) => {
      if (request.method === "OPTIONS") {
        return generatePreflightResponse([method]);
      }

      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams.entries());
      const res = await service(params as DataValue);
    
      return json(res, { status: Number(res.code) });
    }, true),
  };
}

export { createServerAction, createPreflightAction, createServiceAdapter };
