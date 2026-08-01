import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type AdminUser = components["schemas"]["AdminUserResponse"];
export type AdminUserListItem = components["schemas"]["AdminUserListItem"];
export type AdminUserList = components["schemas"]["AdminUserListResponse"];
export type AdminUserDetail = components["schemas"]["AdminUserDetailResponse"];

export interface AdminUserListQuery { status?: "active" | "disabled"; email?: string; page?: number; perPage?: number }

export async function listAdminUsers(client: APIClient, query: AdminUserListQuery = {}): Promise<AdminUserList> {
  const params = new URLSearchParams();
  if (query.status !== undefined) params.set("status", query.status);
  if (query.email !== undefined) params.set("email", query.email);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.perPage !== undefined) params.set("per_page", String(query.perPage));
  const suffix = params.toString();
  return readJSON(await client.request(`/users${suffix === "" ? "" : `?${suffix}`}`), "user list", isAdminUserList);
}

export async function getAdminUser(client: APIClient, userID: string): Promise<AdminUserDetail> {
  return readJSON(await client.request(`/users/${encodeURIComponent(userID)}`), "user detail", isAdminUserDetail);
}

export async function updateAdminUserStatus(client: APIClient, userID: string, status: "active" | "disabled", expectedVersion: number): Promise<AdminUser> {
  return readJSON(await client.request(`/users/${encodeURIComponent(userID)}/status`, { method: "PATCH", body: JSON.stringify({ status, expected_version: expectedVersion }) }), "user", isAdminUser);
}

async function readJSON<T>(response: Response, label: string, guard: (value: unknown) => value is T): Promise<T> {
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown; try { body = await response.json(); } catch { throw new Error(`Invalid ${label} response`); }
  if (!guard(body)) throw new Error(`Invalid ${label} response`); return body;
}
function isAdminUserList(value: unknown): value is AdminUserList { return isRecord(value) && Array.isArray(value.items) && value.items.every(isAdminUserListItem) && isPageInfo(value.page); }
function isAdminUserListItem(value: unknown): value is AdminUserListItem {
  if (!isAdminUser(value)) return false;
  const item = value as AdminUserListItem;
  return isNonNegative(item.membership_count) && isNonNegative(item.active_membership_count);
}
function isAdminUserDetail(value: unknown): value is AdminUserDetail { return isRecord(value) && isAdminUser(value.user) && Array.isArray(value.memberships) && value.memberships.every(isMembershipSummary); }
function isMembershipSummary(value: unknown): boolean { return isRecord(value) && typeof value.id === "string" && typeof value.account_id === "string" && typeof value.account_slug === "string" && (value.status === "active" || value.status === "disabled") && isPositive(value.authorization_version) && typeof value.created_at === "string" && typeof value.updated_at === "string"; }
function isAdminUser(value: unknown): value is AdminUser { return isRecord(value) && typeof value.id === "string" && value.id !== "" && typeof value.email === "string" && value.email !== "" && (value.status === "active" || value.status === "disabled") && isPositive(value.authorization_version) && typeof value.created_at === "string" && typeof value.updated_at === "string"; }
function isPageInfo(value: unknown): boolean { return isRecord(value) && isPositive(value.page) && isPositive(value.per_page) && isNonNegative(value.total_items) && isNonNegative(value.total_pages); }
function isPositive(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function isNonNegative(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
