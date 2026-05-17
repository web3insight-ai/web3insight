import { QueryClient } from "@tanstack/react-query"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Increased stale times for better performance:
        // - Statistics and ecosystem data changes infrequently
        // - Reduces unnecessary API calls and improves UX
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes cache retention
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status: number }).status
            if (status >= 400 && status < 500) return false
          }
          return failureCount < 2
        },
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
