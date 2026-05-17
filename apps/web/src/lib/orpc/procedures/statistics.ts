import { os } from "@orpc/server"
import { StatisticsDataSchema } from "../schemas"
import { fetchStatisticsOverview } from "@/services/api/repository"

// Reason: Reuse the orpc-backed repository helper instead of duplicating the
// fetch logic here. fetchStatisticsOverview talks to the Hono backend via
// @web3insight/api-contract's total.* procedures and returns the same shape.
export const getStatistics = os
  .output(StatisticsDataSchema)
  .handler(async () => {
    const result = await fetchStatisticsOverview()
    if (!result.success) {
      console.error(
        "request failed while fetching statistics overview",
        result.code,
        result.message,
      )
      return { ecosystem: 0, repository: 0, developer: 0, coreDeveloper: 0 }
    }
    return {
      ecosystem: Number(result.data.ecosystem),
      repository: Number(result.data.repository),
      developer: Number(result.data.developer),
      coreDeveloper: Number(result.data.coreDeveloper),
    }
  })
