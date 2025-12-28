import { getStatistics } from "./procedures"

export const router = {
  statistics: {
    get: getStatistics,
  },
}

export type AppRouter = typeof router
