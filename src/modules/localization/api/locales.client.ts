import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type Locale = components["schemas"]["Locale"];
export type LocaleList = components["schemas"]["LocaleListResponse"];

export async function listLocales(client: APIClient): Promise<LocaleList> { return readJSON(await client.request("/locales"), "locale list", isLocaleList); }
export async function createLocale(client: APIClient, input: components["schemas"]["LocaleCreateRequest"]): Promise<Locale> { return readJSON(await client.request("/locales", { method: "POST", body: JSON.stringify(input) }), "locale", isLocale); }
export async function updateLocale(client: APIClient, localeID: string, input: components["schemas"]["LocaleUpdateRequest"]): Promise<components["schemas"]["LocaleUpdateResponse"]> { return readJSON(await client.request(`/locales/${encodeURIComponent(localeID)}`, { method: "PATCH", body: JSON.stringify(input) }), "locale update", isVersioned); }
export async function updateLocaleStatus(client: APIClient, localeID: string, input: components["schemas"]["LocaleStatusRequest"]): Promise<components["schemas"]["LocaleStatusResponse"]> { return readJSON(await client.request(`/locales/${encodeURIComponent(localeID)}/status`, { method: "PATCH", body: JSON.stringify(input) }), "locale status", isVersionedStatus); }
export async function setDefaultLocale(client: APIClient, localeID: string, expectedVersion: number): Promise<components["schemas"]["DefaultLocaleUpdateResult"]> { return readJSON(await client.request(`/locales/${encodeURIComponent(localeID)}/default`, { method: "PUT", body: JSON.stringify({ expected_version: expectedVersion }) }), "default locale", isDefaultResult); }

async function readJSON<T>(response: Response, label: string, guard: (value: unknown) => value is T): Promise<T> { if (!response.ok) throw await errorFromResponse(response); let body: unknown; try { body = await response.json(); } catch { throw new Error(`Invalid ${label} response`); } if (!guard(body)) throw new Error(`Invalid ${label} response`); return body; }
function isLocaleList(value: unknown): value is LocaleList { return isRecord(value) && Array.isArray(value.items) && value.items.every(isLocale); }
function isLocale(value: unknown): value is Locale { return isRecord(value) && typeof value.id === "string" && typeof value.code === "string" && typeof value.name === "string" && (value.direction === "ltr" || value.direction === "rtl") && typeof value.enabled === "boolean" && typeof value.selectable === "boolean" && typeof value.default === "boolean" && (value.version === undefined || isPositive(value.version)); }
function isVersioned(value: unknown): value is components["schemas"]["LocaleUpdateResponse"] { return isRecord(value) && typeof value.id === "string" && typeof value.name === "string" && (value.direction === "ltr" || value.direction === "rtl") && isPositive(value.version); }
function isVersionedStatus(value: unknown): value is components["schemas"]["LocaleStatusResponse"] { return isRecord(value) && typeof value.id === "string" && typeof value.enabled === "boolean" && typeof value.selectable === "boolean" && isPositive(value.version); }
function isDefaultResult(value: unknown): value is components["schemas"]["DefaultLocaleUpdateResult"] { return isRecord(value) && typeof value.locale_id === "string" && typeof value.previous_default_locale_id === "string" && isPositive(value.version); }
function isPositive(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
