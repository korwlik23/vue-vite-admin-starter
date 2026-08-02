import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type Menu = components["schemas"]["Menu"];
export type MenuItem = components["schemas"]["MenuItem"];
export type MenuItemInput = components["schemas"]["MenuItemInput"];
export type MenuListResponse = components["schemas"]["MenuListResponse"];
export type MenuMutationRequest = components["schemas"]["MenuMutationRequest"];
export type MenuUpdateRequest = MenuMutationRequest & { expected_version: number };
export type MenuReorderRequest = components["schemas"]["MenuReorderRequest"];
export type ExpectedVersionRequest = components["schemas"]["ExpectedVersionRequest"];

export interface MenuListQuery {
  localeId?: string;
  enabled?: boolean;
  limit?: number;
  afterUpdatedAt?: string;
  afterId?: string;
}

export async function listNavigationMenus(
  client: APIClient,
  query: MenuListQuery = {},
): Promise<MenuListResponse> {
  const params = new URLSearchParams();
  if (query.localeId !== undefined) params.set("locale_id", query.localeId);
  if (query.enabled !== undefined) params.set("enabled", String(query.enabled));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.afterUpdatedAt !== undefined) params.set("after_updated_at", query.afterUpdatedAt);
  if (query.afterId !== undefined) params.set("after_id", query.afterId);
  const suffix = params.toString();
  return readJSON(
    await client.request(`/navigation/menus${suffix === "" ? "" : `?${suffix}`}`),
    "navigation menu list",
    isMenuList,
  );
}

export async function getNavigationMenu(client: APIClient, menuID: string): Promise<Menu> {
  return readJSON(await client.request(`/navigation/menus/${encodeURIComponent(menuID)}`), "navigation menu", isMenu);
}

export async function createNavigationMenu(client: APIClient, input: MenuMutationRequest): Promise<Menu> {
  return readJSON(await client.request("/navigation/menus", { method: "POST", body: JSON.stringify(input) }), "navigation menu", isMenu);
}

export async function updateNavigationMenu(client: APIClient, menuID: string, input: MenuUpdateRequest): Promise<Menu> {
  return readJSON(await client.request(`/navigation/menus/${encodeURIComponent(menuID)}`, { method: "PATCH", body: JSON.stringify(input) }), "navigation menu", isMenu);
}

export async function deleteNavigationMenu(client: APIClient, menuID: string, input: ExpectedVersionRequest): Promise<void> {
  const response = await client.request(`/navigation/menus/${encodeURIComponent(menuID)}`, { method: "DELETE", body: JSON.stringify(input) });
  if (!response.ok) throw await errorFromResponse(response);
  if (response.status !== 204) throw new Error("Invalid navigation menu deletion response");
}

export async function reorderNavigationMenu(client: APIClient, menuID: string, input: MenuReorderRequest): Promise<Menu> {
  return readJSON(await client.request(`/navigation/menus/${encodeURIComponent(menuID)}/reorder`, { method: "POST", body: JSON.stringify(input) }), "navigation menu", isMenu);
}

async function readJSON<T>(response: Response, label: string, guard: (value: unknown) => value is T): Promise<T> {
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try { body = await response.json(); } catch { throw new Error(`Invalid ${label} response`); }
  if (!guard(body)) throw new Error(`Invalid ${label} response`);
  return body;
}

function isMenuList(value: unknown): value is MenuListResponse {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isMenu) &&
    (value.next === undefined || value.next === null || (isRecord(value.next) && hasText(value.next, "id") && hasText(value.next, "updated_at")));
}

function isMenu(value: unknown): value is Menu {
  return isRecord(value) && hasText(value, "id") && hasText(value, "account_id") && hasText(value, "locale_id") &&
    hasText(value, "key") && hasText(value, "name") && typeof value.enabled === "boolean" &&
    isPositiveInteger(value.version) && Array.isArray(value.items) && value.items.every(isMenuItem) &&
    hasText(value, "created_at") && hasText(value, "updated_at");
}

function isMenuItem(value: unknown): value is MenuItem {
  return isRecord(value) && hasText(value, "id") && hasText(value, "label") && hasText(value, "target") &&
    (value.target_kind === "internal_path" || value.target_kind === "external_url" || value.target_kind === "content_key") &&
    isNonNegativeInteger(value.position) && typeof value.enabled === "boolean" && isPositiveInteger(value.version) &&
    (value.parent_id === undefined || typeof value.parent_id === "string") &&
    (value.children === undefined || (Array.isArray(value.children) && value.children.every(isMenuItem)));
}

function hasText(value: Record<string, unknown>, field: string): boolean { return typeof value[field] === "string" && value[field] !== ""; }
function isPositiveInteger(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function isNonNegativeInteger(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
