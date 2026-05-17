import { z } from "zod"

export const StatisticsDataSchema = z.object({
  ecosystem: z.number(),
  repository: z.number(),
  developer: z.number(),
  coreDeveloper: z.number(),
})

export type StatisticsData = z.infer<typeof StatisticsDataSchema>
