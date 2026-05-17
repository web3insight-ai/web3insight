import { RPCHandler } from "@orpc/server/fetch"
import { onError } from "@orpc/server"
import { router } from "@/lib/orpc/router"

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]:", error)
    }),
  ],
})

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {},
  })

  return response ?? new Response("Not found", { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
