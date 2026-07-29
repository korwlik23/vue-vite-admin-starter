import { queryOptions } from "@tanstack/vue-query";

import type { AuthClient } from "@/modules/identity/api/auth.client";

export const sessionQueryKey = ["identity", "session"] as const;

export function sessionQuery(auth: AuthClient) {
  return queryOptions({
    queryKey: sessionQueryKey,
    queryFn: () => auth.currentSession(),
    staleTime: 15_000,
    retry: false,
  });
}
