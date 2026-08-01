import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type Membership = components["schemas"]["MembershipResponse"];
export type MembershipList = components["schemas"]["MembershipListResponse"];
export interface MembershipListQuery { status?: "active" | "disabled"; page?: number; perPage?: number }

export async function listMemberships(client: APIClient, accountID: string, query: MembershipListQuery = {}): Promise<MembershipList> {
  const params = new URLSearchParams();
  if (query.status !== undefined) params.set("status", query.status);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.perPage !== undefined) params.set("per_page", String(query.perPage));
  const suffix = params.toString();
  return readJSON(await client.request(`/accounts/${encodeURIComponent(accountID)}/memberships${suffix === "" ? "" : `?${suffix}`}`), "membership list", isMembershipList);
}

export async function updateMembershipStatus(client: APIClient, accountID: string, membershipID: string, status: "active" | "disabled", expectedVersion: number): Promise<Membership> {
  return readJSON(await client.request(`/accounts/${encodeURIComponent(accountID)}/memberships/${encodeURIComponent(membershipID)}/status`, { method: "PATCH", body: JSON.stringify({ status, expected_version: expectedVersion }) }), "membership", isMembership);
}

async function readJSON<T>(response: Response, label: string, guard: (value: unknown) => value is T): Promise<T> { if (!response.ok) throw await errorFromResponse(response); let body: unknown; try { body = await response.json(); } catch { throw new Error(`Invalid ${label} response`); } if (!guard(body)) throw new Error(`Invalid ${label} response`); return body; }
function isMembershipList(value: unknown): value is MembershipList { return isRecord(value) && Array.isArray(value.items) && value.items.every(isMembership) && isPageInfo(value.page); }
function isMembership(value: unknown): value is Membership { return isRecord(value) && typeof value.id === "string" && value.id !== "" && typeof value.account_id === "string" && typeof value.account_slug === "string" && typeof value.user_id === "string" && typeof value.user_email === "string" && value.user_email !== "" && (value.status === "active" || value.status === "disabled") && isPositive(value.authorization_version) && typeof value.created_at === "string" && typeof value.updated_at === "string"; }
function isPageInfo(value: unknown): boolean { return isRecord(value) && isPositive(value.page) && isPositive(value.per_page) && isNonNegative(value.total_items) && isNonNegative(value.total_pages); }
function isPositive(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function isNonNegative(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
