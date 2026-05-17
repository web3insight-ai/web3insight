import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { orpcClient } from "@/lib/orpc/client"

export const orpc = createTanstackQueryUtils(orpcClient)
