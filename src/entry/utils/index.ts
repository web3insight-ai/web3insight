import { type ActionFunctionArgs, json } from "@remix-run/node";

type RequestMethod = "OPTIONS" | "GET" | "POST" | "PUT" | "DELETE";
type AllowedMethods = RequestMethod | "*" | RequestMethod[];

function createServerAction<
  ReturnType,
  ActionContext extends ActionFunctionArgs = ActionFunctionArgs
>(
  allowedMethods: AllowedMethods,
  handler: (ctx: ActionContext) => ReturnType | Promise<ReturnType>,
): (ctx: ActionContext) => Promise<ReturnType> {
  return async (ctx: ActionContext) => {
    let methodValid = false;

    if (!allowedMethods || allowedMethods === "*") {
      methodValid = true;
    } else {
      methodValid = ([] as RequestMethod[]).concat(allowedMethods).includes(ctx.request.method as RequestMethod);
    }

    return methodValid ? handler(ctx) : json({ error: "Method not allowed" }, { status: 405 }) as ReturnType;
  }
}

function createPreflightAction(allowedMethods: AllowedMethods = ["POST", "OPTIONS"]) {
  return createServerAction("OPTIONS", () => new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": ([] as AllowedMethods[]).concat(allowedMethods).join(", "),
      "Access-Control-Allow-Headers": "Content-Type",
    },
  }))
}

export { createServerAction, createPreflightAction };
