import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type ContentAudit = components["schemas"]["ContentAudit"];
export type ContentAuditListResponse = components["schemas"]["ContentAuditListResponse"];
export type RunContentAuditRequest = components["schemas"]["RunContentAuditRequest"];

export interface AuditListQuery {
  contentId?: string;
  translationId?: string;
  localeId?: string;
  status?: "pass" | "warning" | "error";
  limit?: number;
  afterUpdatedAt?: string;
  afterId?: string;
}

export async function listDiscoverabilityAudits(client: APIClient, query: AuditListQuery = {}): Promise<ContentAuditListResponse> {
  const params = new URLSearchParams();
  if (query.contentId !== undefined) params.set("content_id", query.contentId);
  if (query.translationId !== undefined) params.set("translation_id", query.translationId);
  if (query.localeId !== undefined) params.set("locale_id", query.localeId);
  if (query.status !== undefined) params.set("status", query.status);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.afterUpdatedAt !== undefined) params.set("after_updated_at", query.afterUpdatedAt);
  if (query.afterId !== undefined) params.set("after_id", query.afterId);
  const suffix = params.toString();
  return readJSON(await client.request(`/discoverability/audits${suffix === "" ? "" : `?${suffix}`}`), "content audit list", isAuditList);
}

export async function runDiscoverabilityAudit(client: APIClient, input: RunContentAuditRequest): Promise<ContentAudit> {
  return readJSON(await client.request("/discoverability/audits", { method: "POST", body: JSON.stringify(input) }), "content audit", isAudit);
}

export async function getDiscoverabilityAudit(client: APIClient, auditID: string): Promise<ContentAudit> {
  return readJSON(await client.request(`/discoverability/audits/${encodeURIComponent(auditID)}`), "content audit", isAudit);
}

async function readJSON<T>(response: Response, label: string, guard: (value: unknown) => value is T): Promise<T> {
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try { body = await response.json(); } catch { throw new Error(`Invalid ${label} response`); }
  if (!guard(body)) throw new Error(`Invalid ${label} response`);
  return body;
}

function isAuditList(value: unknown): value is ContentAuditListResponse {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isAudit) &&
    (value.next === undefined || value.next === null || (isRecord(value.next) && hasText(value.next, "id") && hasText(value.next, "updated_at")));
}

function isAudit(value: unknown): value is ContentAudit {
  return isRecord(value) && hasText(value, "id") && hasText(value, "account_id") && hasText(value, "content_id") &&
    hasText(value, "translation_id") && hasText(value, "locale_id") && isPositiveInteger(value.content_version) &&
    isPositiveInteger(value.translation_version) && ["pass", "warning", "error"].includes(String(value.status)) &&
    Array.isArray(value.checks) && value.checks.every(isCheck) && hasText(value, "created_at") && hasText(value, "updated_at");
}

function isCheck(value: unknown): boolean {
  return isRecord(value) && hasText(value, "rule_key") && hasText(value, "message") && hasText(value, "observed_value") &&
    ["info", "warning", "error"].includes(String(value.severity)) && ["pass", "warning", "error"].includes(String(value.status));
}

function hasText(value: Record<string, unknown>, field: string): boolean { return typeof value[field] === "string" && value[field] !== ""; }
function isPositiveInteger(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
