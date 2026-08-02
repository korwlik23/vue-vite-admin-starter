import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type PublishingRevision = components["schemas"]["Revision"];
export type PublishingRevisionList = components["schemas"]["RevisionListResponse"];
export type RevisionRollbackRequest = components["schemas"]["RevisionRollbackRequest"];
export type RevisionRollbackResponse = components["schemas"]["RevisionRollbackResponse"];

export interface PublishingRevisionQuery {
  translationId: string;
  limit?: number;
  afterCreatedAt?: string;
  afterId?: string;
}

export async function listPublishingRevisions(
  client: APIClient,
  contentID: string,
  query: PublishingRevisionQuery,
): Promise<PublishingRevisionList> {
  const params = new URLSearchParams({ translation_id: query.translationId });
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.afterCreatedAt !== undefined) params.set("after_created_at", query.afterCreatedAt);
  if (query.afterId !== undefined) params.set("after_id", query.afterId);
  const response = await client.request(
    `/publishing/content/${encodeURIComponent(contentID)}/revisions?${params.toString()}`,
  );
  return readJSON(response, "publishing revision list", isRevisionList);
}

export async function rollbackPublishingRevision(
  client: APIClient,
  contentID: string,
  revisionID: string,
  input: RevisionRollbackRequest,
): Promise<RevisionRollbackResponse> {
  const response = await client.request(
    `/publishing/content/${encodeURIComponent(contentID)}/revisions/${encodeURIComponent(revisionID)}/rollback`,
    { method: "POST", body: JSON.stringify(input) },
  );
  return readJSON(response, "publishing revision rollback", isRevisionRollbackResponse);
}

async function readJSON<T>(
  response: Response,
  label: string,
  guard: (value: unknown) => value is T,
): Promise<T> {
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid ${label} response`);
  }
  if (!guard(body)) throw new Error(`Invalid ${label} response`);
  return body;
}

function isRevisionList(value: unknown): value is PublishingRevisionList {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isRevision) &&
    (value.next === undefined || value.next === null || isCursor(value.next))
  );
}

function isRevisionRollbackResponse(value: unknown): value is RevisionRollbackResponse {
  return (
    isRecord(value) &&
    isRevision(value.revision) &&
    isRecord(value.content) &&
    hasText(value.content, "content_id") &&
    hasText(value.content, "translation_id") &&
    isPositiveInteger(value.content.content_version) &&
    isPositiveInteger(value.content.translation_version) &&
    isStatus(value.content.status)
  );
}

function isRevision(value: unknown): value is PublishingRevision {
  return (
    isRecord(value) &&
    hasText(value, "id") &&
    hasText(value, "content_id") &&
    hasText(value, "translation_id") &&
    hasText(value, "author_id") &&
    typeof value.snapshot_hash === "string" &&
    /^[a-f0-9]{64}$/.test(value.snapshot_hash) &&
    typeof value.change_summary === "string" &&
    isPositiveInteger(value.source_version) &&
    typeof value.created_at === "string"
  );
}

function isCursor(value: unknown): boolean {
  return isRecord(value) && hasText(value, "created_at") && hasText(value, "id");
}

function isStatus(value: unknown): boolean {
  return ["draft", "review", "published", "scheduled", "archived"].includes(String(value));
}

function hasText(value: Record<string, unknown>, field: string): boolean {
  return typeof value[field] === "string" && value[field] !== "";
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
