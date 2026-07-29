import { QueryClient } from "@tanstack/vue-query";

import { APIError } from "@/shared/api/errors";

export const authMutationOptions = {
  retry: false,
} as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry(failureCount, error) {
          if (
            error instanceof APIError &&
            (error.status === 401 || error.status === 403)
          ) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
