import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type Catalog = components["schemas"]["TranslationCatalogResponse"];
export type CatalogExport = components["schemas"]["CatalogExport"];
export type CatalogImportRequest =
  components["schemas"]["CatalogImportRequest"];
export type CatalogImportResponse =
  components["schemas"]["CatalogImportResponse"];
export async function getCatalog(
  client: APIClient,
  locale: string,
  category: string,
): Promise<Catalog> {
  const params = new URLSearchParams({ locale, category });
  const response = await client.request(
    `/localization/catalog?${params.toString()}`,
  );
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Invalid catalog response");
  }
  if (!isCatalog(body)) throw new Error("Invalid catalog response");
  return body;
}
export async function updateCatalog(
  client: APIClient,
  input: components["schemas"]["TranslationCatalogUpdateRequest"],
): Promise<components["schemas"]["TranslationCatalogUpdateResponse"]> {
  const response = await client.request("/localization/catalog", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Invalid catalog update response");
  }
  if (!isUpdate(body)) throw new Error("Invalid catalog update response");
  return body;
}
export async function exportCatalog(
  client: APIClient,
  locale: string,
  category: string,
): Promise<CatalogExport> {
  const params = new URLSearchParams({ locale, category });
  const response = await client.request(
    `/localization/catalog/export?${params.toString()}`,
  );
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Invalid catalog export response");
  }
  if (!isExport(body)) throw new Error("Invalid catalog export response");
  return body;
}
export async function importCatalog(
  client: APIClient,
  input: CatalogImportRequest,
): Promise<CatalogImportResponse> {
  const response = await client.request("/localization/catalog/import", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Invalid catalog import response");
  }
  if (!isImport(body)) throw new Error("Invalid catalog import response");
  return body;
}
function isCatalog(value: unknown): value is Catalog {
  return (
    isRecord(value) &&
    typeof value.locale === "string" &&
    typeof value.category === "string" &&
    isPositive(value.version) &&
    isRecord(value.entries) &&
    Object.values(value.entries).every((entry) => typeof entry === "string")
  );
}
function isUpdate(
  value: unknown,
): value is components["schemas"]["TranslationCatalogUpdateResponse"] {
  return (
    isRecord(value) &&
    typeof value.locale === "string" &&
    typeof value.category === "string" &&
    isPositive(value.version)
  );
}
function isExport(value: unknown): value is CatalogExport {
  return (
    isRecord(value) &&
    typeof value.locale === "string" &&
    typeof value.category === "string" &&
    isNonNegative(value.version) &&
    isEntries(value.entries)
  );
}
function isImport(value: unknown): value is CatalogImportResponse {
  return (
    isRecord(value) &&
    typeof value.locale === "string" &&
    typeof value.category === "string" &&
    isPositive(value.version)
  );
}
function isEntries(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([key, entry]) => key.length > 0 && typeof entry === "string",
    )
  );
}
function isPositive(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
function isNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
