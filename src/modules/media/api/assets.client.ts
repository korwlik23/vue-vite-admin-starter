import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type Asset = components["schemas"]["Asset"];
export type AssetListResponse = components["schemas"]["AssetListResponse"];
export type DeleteAssetRequest = components["schemas"]["DeleteAssetRequest"];

export interface AssetListQuery {
  limit?: number;
  afterUpdatedAt?: string;
  afterId?: string;
}

export async function listMediaAssets(
  client: APIClient,
  query: AssetListQuery = {},
): Promise<AssetListResponse> {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.afterUpdatedAt !== undefined) params.set("after_updated_at", query.afterUpdatedAt);
  if (query.afterId !== undefined) params.set("after_id", query.afterId);
  const suffix = params.toString();
  const response = await client.request(`/media/assets${suffix === "" ? "" : `?${suffix}`}`);
  return readJSON(response, "media asset list", isAssetList);
}

export async function deleteMediaAsset(
  client: APIClient,
  assetID: string,
  input: DeleteAssetRequest,
): Promise<void> {
  const response = await client.request(`/media/assets/${encodeURIComponent(assetID)}`, {
    method: "DELETE",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await errorFromResponse(response);
  if (response.status !== 204) throw new Error("Invalid media asset deletion response");
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

function isAssetList(value: unknown): value is AssetListResponse {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isAsset) &&
    (value.next === undefined || value.next === null || isCursor(value.next));
}

function isAsset(value: unknown): value is Asset {
  return isRecord(value) && hasText(value, "id") && hasText(value, "account_id") &&
    hasText(value, "original_name") && hasText(value, "mime_type") &&
    isNonNegativeInteger(value.byte_size) && /^[a-f0-9]{64}$/.test(String(value.sha256)) &&
    isPositiveInteger(value.version) && typeof value.created_at === "string" &&
    typeof value.updated_at === "string" && optionalNonNegativeInteger(value.width) &&
    optionalNonNegativeInteger(value.height);
}

function isCursor(value: unknown): boolean {
  return isRecord(value) && hasText(value, "id") && hasText(value, "updated_at");
}

function optionalNonNegativeInteger(value: unknown): boolean {
  return value === undefined || (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function hasText(value: Record<string, unknown>, field: string): boolean {
  return typeof value[field] === "string" && value[field] !== "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
