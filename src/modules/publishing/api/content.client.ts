import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type PublishingContent = components["schemas"]["ContentResponse"];
export type PublishingContentListItem = components["schemas"]["ContentListItem"];
export type PublishingContentList = components["schemas"]["ContentListResponse"];
export type PublishingBlock = components["schemas"]["Block"];
export type ContentMutationRequest = components["schemas"]["ContentMutationRequest"];
export type ContentUpdateRequest = components["schemas"]["ContentUpdateRequest"];
export type ContentDeleteRequest = components["schemas"]["ContentDeleteRequest"];
export type CreatePublishingPageRequest = ContentMutationRequest & {
  content_key: string;
  kind: "page";
};
export type CreatePublishingPostRequest = ContentMutationRequest & {
  content_key: string;
  kind: "post";
};
export type PreviewIssueRequest = components["schemas"]["PreviewIssueRequest"];
export type PreviewIssueResponse = components["schemas"]["PreviewIssueResponse"];

export interface PublishingContentListQuery {
  locale: string;
  limit?: number;
  afterUpdatedAt?: string;
  afterId?: string;
}

export async function listPublishingPages(
  client: APIClient,
  query: PublishingContentListQuery,
): Promise<PublishingContentList> {
  return listPublishingContent(client, "/publishing/pages", query);
}

export async function listPublishingPosts(
  client: APIClient,
  query: PublishingContentListQuery,
): Promise<PublishingContentList> {
  return listPublishingContent(client, "/publishing/posts", query);
}

export async function getPublishingPage(
  client: APIClient,
  pageID: string,
  locale: string,
): Promise<PublishingContent> {
  return readJSON(
    await client.request(`/publishing/pages/${encodeURIComponent(pageID)}?locale=${encodeURIComponent(locale)}`),
    "publishing page",
    isPublishingContent,
  );
}

export async function getPublishingPost(
  client: APIClient,
  postID: string,
  locale: string,
): Promise<PublishingContent> {
  return readJSON(
    await client.request(`/publishing/posts/${encodeURIComponent(postID)}?locale=${encodeURIComponent(locale)}`),
    "publishing post",
    isPublishingContent,
  );
}

async function listPublishingContent(
  client: APIClient,
  path: "/publishing/pages" | "/publishing/posts",
  query: PublishingContentListQuery,
): Promise<PublishingContentList> {
  const params = new URLSearchParams({ locale: query.locale });
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.afterUpdatedAt !== undefined) params.set("after_updated_at", query.afterUpdatedAt);
  if (query.afterId !== undefined) params.set("after_id", query.afterId);
  return readJSON(
    await client.request(`${path}?${params.toString()}`),
    "publishing content list",
    isPublishingContentList,
  );
}

export async function createPublishingPage(
  client: APIClient,
  input: CreatePublishingPageRequest,
): Promise<PublishingContent> {
  const response = await client.request("/publishing/pages", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return readJSON(response, "publishing page", isPublishingContent);
}

export async function updatePublishingPage(
  client: APIClient,
  pageID: string,
  input: ContentUpdateRequest,
): Promise<PublishingContent> {
  const response = await client.request(
    `/publishing/pages/${encodeURIComponent(pageID)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return readJSON(response, "publishing page", isPublishingContent);
}

export async function deletePublishingPage(
  client: APIClient,
  pageID: string,
  input: ContentDeleteRequest,
): Promise<void> {
  await readEmpty(
    await client.request(`/publishing/pages/${encodeURIComponent(pageID)}`, {
      method: "DELETE",
      body: JSON.stringify(input),
    }),
    "publishing page deletion",
  );
}

export async function createPublishingPost(
  client: APIClient,
  input: CreatePublishingPostRequest,
): Promise<PublishingContent> {
  const response = await client.request("/publishing/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return readJSON(response, "publishing post", isPublishingContent);
}

export async function updatePublishingPost(
  client: APIClient,
  postID: string,
  input: ContentUpdateRequest,
): Promise<PublishingContent> {
  const response = await client.request(
    `/publishing/posts/${encodeURIComponent(postID)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return readJSON(response, "publishing post", isPublishingContent);
}

export async function deletePublishingPost(
  client: APIClient,
  postID: string,
  input: ContentDeleteRequest,
): Promise<void> {
  await readEmpty(
    await client.request(`/publishing/posts/${encodeURIComponent(postID)}`, {
      method: "DELETE",
      body: JSON.stringify(input),
    }),
    "publishing post deletion",
  );
}

export async function issuePublishingPreview(
  client: APIClient,
  contentID: string,
  input: PreviewIssueRequest,
): Promise<PreviewIssueResponse> {
  const response = await client.request(
    `/publishing/content/${encodeURIComponent(contentID)}/preview`,
    { method: "POST", body: JSON.stringify(input) },
  );
  return readJSON(response, "publishing preview", isPreviewIssueResponse);
}

async function readJSON<T>(
  response: Response,
  label: string,
  guard: (value: unknown) => value is T,
): Promise<T> {
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid ${label} response`);
  }
  if (!guard(body)) {
    throw new Error(`Invalid ${label} response`);
  }
  return body;
}

async function readEmpty(response: Response, label: string): Promise<void> {
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  if (response.status !== 204) {
    throw new Error(`Invalid ${label} response`);
  }
}

function isPublishingContent(value: unknown): value is PublishingContent {
  return (
    isRecord(value) &&
    hasText(value, "content_id") &&
    hasText(value, "translation_id") &&
    hasText(value, "account_id") &&
    hasText(value, "locale_id") &&
    (value.kind === "page" || value.kind === "post") &&
    hasText(value, "content_key") &&
    isStatus(value.content_status) &&
    isPositiveInteger(value.content_version) &&
    isStatus(value.translation_status) &&
    isPositiveInteger(value.translation_version) &&
    hasText(value, "slug") &&
    hasText(value, "path") &&
    hasText(value, "title") &&
    typeof value.excerpt === "string" &&
    isBlocks(value.blocks) &&
    isSEO(value.seo) &&
    isGEO(value.geo) &&
    isAEO(value.aeo)
  );
}

function isPublishingContentList(value: unknown): value is PublishingContentList {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isPublishingContentListItem) &&
    (value.next === undefined || value.next === null || isContentCursor(value.next));
}

function isPublishingContentListItem(value: unknown): value is PublishingContentListItem {
  return isRecord(value) && hasText(value, "content_id") && hasText(value, "account_id") &&
    hasText(value, "locale_id") && hasText(value, "translation_id") && hasText(value, "content_key") &&
    hasText(value, "slug") && hasText(value, "path") && hasText(value, "title") &&
    isStatus(value.content_status) && isStatus(value.translation_status) &&
    isPositiveInteger(value.content_version) && isPositiveInteger(value.translation_version) &&
    hasText(value, "updated_at") && (value.kind === "page" || value.kind === "post");
}

function isContentCursor(value: unknown): boolean {
  return isRecord(value) && hasText(value, "id") && hasText(value, "updated_at");
}

function isPreviewIssueResponse(value: unknown): value is PreviewIssueResponse {
  return (
    isRecord(value) &&
    hasText(value, "token") &&
    hasText(value, "token_id") &&
    hasText(value, "revision_id") &&
    hasText(value, "expires_at")
  );
}

function isBlocks(value: unknown): value is PublishingContent["blocks"] {
  return (
    Array.isArray(value) &&
    value.every(
      (block) =>
        isRecord(block) &&
        ["text", "image", "callout", "answer", "steps", "comparison"].includes(
          String(block.type),
        ) &&
        isRecord(block.data),
    )
  );
}

function isSEO(value: unknown): value is PublishingContent["seo"] {
  return (
    isRecord(value) &&
    hasText(value, "title") &&
    typeof value.description === "string" &&
    typeof value.canonical_url === "string" &&
    typeof value.robots === "string" &&
    (value.structured_data === undefined || isRecord(value.structured_data))
  );
}

function isGEO(value: unknown): value is PublishingContent["geo"] {
  return isRecord(value) && typeof value.region === "string" && typeof value.locality === "string";
}

function isAEO(value: unknown): value is PublishingContent["aeo"] {
  return isRecord(value) && typeof value.question === "string" && typeof value.answer === "string";
}

function isStatus(value: unknown): value is PublishingContent["content_status"] {
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
