import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type SEODefaults = components["schemas"]["SEODefaults"];
export type SEOUpdateRequest = components["schemas"]["SEOUpdateRequest"];

export async function getDiscoverabilitySEO(client: APIClient, localeID: string): Promise<SEODefaults> {
  const params = new URLSearchParams({ locale_id: localeID });
  return readJSON(await client.request(`/discoverability/seo?${params.toString()}`), "SEO defaults", isSEODefaults);
}

export async function updateDiscoverabilitySEO(client: APIClient, input: SEOUpdateRequest): Promise<SEODefaults> {
  return readJSON(await client.request("/discoverability/seo", { method: "PATCH", body: JSON.stringify(input) }), "SEO defaults", isSEODefaults);
}

async function readJSON<T>(response: Response, label: string, guard: (value: unknown) => value is T): Promise<T> {
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try { body = await response.json(); } catch { throw new Error(`Invalid ${label} response`); }
  if (!guard(body)) throw new Error(`Invalid ${label} response`);
  return body;
}

function isSEODefaults(value: unknown): value is SEODefaults {
  return isRecord(value) && hasText(value, "id") && hasText(value, "account_id") && hasText(value, "locale_id") &&
    typeof value.title === "string" && typeof value.description === "string" && hasText(value, "canonical_base") &&
    typeof value.robots === "string" && isPositiveInteger(value.version) && hasText(value, "created_at") && hasText(value, "updated_at");
}

function hasText(value: Record<string, unknown>, field: string): boolean { return typeof value[field] === "string" && value[field] !== ""; }
function isPositiveInteger(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
