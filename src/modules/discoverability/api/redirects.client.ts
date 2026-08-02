import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type Redirect = components["schemas"]["Redirect"];
export type RedirectListResponse = components["schemas"]["RedirectListResponse"];
export type RedirectMutationRequest = components["schemas"]["RedirectMutationRequest"];
export type RedirectUpdateRequest = components["schemas"]["RedirectUpdateRequest"];
export type ExpectedVersionRequest = components["schemas"]["ExpectedVersionRequest"];

export interface RedirectListQuery {
  localeId?: string;
  enabled?: boolean;
  limit?: number;
  afterUpdatedAt?: string;
  afterId?: string;
}

export async function listDiscoverabilityRedirects(client: APIClient, query: RedirectListQuery = {}): Promise<RedirectListResponse> {
  const params = new URLSearchParams();
  if (query.localeId !== undefined) params.set("locale_id", query.localeId);
  if (query.enabled !== undefined) params.set("enabled", String(query.enabled));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.afterUpdatedAt !== undefined) params.set("after_updated_at", query.afterUpdatedAt);
  if (query.afterId !== undefined) params.set("after_id", query.afterId);
  const suffix = params.toString();
  return readJSON(await client.request(`/discoverability/redirects${suffix === "" ? "" : `?${suffix}`}`), "redirect list", isRedirectList);
}

export async function createDiscoverabilityRedirect(client: APIClient, input: RedirectMutationRequest): Promise<Redirect> {
  return readJSON(await client.request("/discoverability/redirects", { method: "POST", body: JSON.stringify(input) }), "redirect", isRedirect);
}

export async function getDiscoverabilityRedirect(client: APIClient, redirectID: string): Promise<Redirect> {
  return readJSON(await client.request(`/discoverability/redirects/${encodeURIComponent(redirectID)}`), "redirect", isRedirect);
}

export async function updateDiscoverabilityRedirect(client: APIClient, redirectID: string, input: RedirectUpdateRequest): Promise<Redirect> {
  return readJSON(await client.request(`/discoverability/redirects/${encodeURIComponent(redirectID)}`, { method: "PATCH", body: JSON.stringify(input) }), "redirect", isRedirect);
}

export async function deleteDiscoverabilityRedirect(client: APIClient, redirectID: string, input: ExpectedVersionRequest): Promise<void> {
  const response = await client.request(`/discoverability/redirects/${encodeURIComponent(redirectID)}`, { method: "DELETE", body: JSON.stringify(input) });
  if (!response.ok) throw await errorFromResponse(response);
  if (response.status !== 204) throw new Error("Invalid redirect deletion response");
}

async function readJSON<T>(response: Response, label: string, guard: (value: unknown) => value is T): Promise<T> {
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try { body = await response.json(); } catch { throw new Error(`Invalid ${label} response`); }
  if (!guard(body)) throw new Error(`Invalid ${label} response`);
  return body;
}

function isRedirectList(value: unknown): value is RedirectListResponse {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isRedirect) &&
    (value.next === undefined || value.next === null || (isRecord(value.next) && hasText(value.next, "id") && hasText(value.next, "updated_at")));
}

function isRedirect(value: unknown): value is Redirect {
  return isRecord(value) && hasText(value, "id") && hasText(value, "account_id") && hasText(value, "locale_id") &&
    hasText(value, "source_path") && hasText(value, "destination_path") && [301, 302, 307, 308].includes(Number(value.status_code)) &&
    typeof value.enabled === "boolean" && isPositiveInteger(value.version) && hasText(value, "created_at") && hasText(value, "updated_at");
}

function hasText(value: Record<string, unknown>, field: string): boolean { return typeof value[field] === "string" && value[field] !== ""; }
function isPositiveInteger(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
