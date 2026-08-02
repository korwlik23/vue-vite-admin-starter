import { queryOptions } from "@tanstack/vue-query";

import type { PublishingContent } from "@/modules/publishing/api/content.client";

export const publishingContentQueryKey = (contentID: string) =>
  ["publishing", "content", contentID] as const;

export interface PublishingContentReader {
  get(contentID: string): Promise<PublishingContent>;
}

export function publishingContentQuery(
  reader: PublishingContentReader,
  contentID: string,
) {
  return queryOptions({
    queryKey: publishingContentQueryKey(contentID),
    queryFn: () => reader.get(contentID),
    staleTime: 15_000,
    retry: false,
  });
}
