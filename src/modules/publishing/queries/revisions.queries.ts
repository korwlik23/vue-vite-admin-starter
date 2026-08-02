import { queryOptions } from "@tanstack/vue-query";

import {
  listPublishingRevisions,
  type PublishingRevisionQuery,
} from "@/modules/publishing/api/revisions.client";
import type { APIClient } from "@/shared/api/client";

export const publishingRevisionsQueryKey = (
  contentID: string,
  query: PublishingRevisionQuery,
) =>
  [
    "publishing",
    "revisions",
    contentID,
    query.translationId,
    query.limit ?? null,
    query.afterCreatedAt ?? null,
    query.afterId ?? null,
  ] as const;

export function publishingRevisionsQuery(
  client: APIClient,
  contentID: string,
  query: PublishingRevisionQuery,
) {
  return queryOptions({
    queryKey: publishingRevisionsQueryKey(contentID, query),
    queryFn: () => listPublishingRevisions(client, contentID, query),
    staleTime: 15_000,
    retry: false,
  });
}
