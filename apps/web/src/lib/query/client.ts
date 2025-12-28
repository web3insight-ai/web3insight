import { QueryClient } from "@tanstack/react-query"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - prevent immediate refetch on mount
        refetchOnWindowFocus: false,
      },
    },
  })
}
