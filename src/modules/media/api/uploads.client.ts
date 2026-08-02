import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";
import type { Asset } from "@/modules/media/api/assets.client";

export type Upload = components["schemas"]["Upload"];
export type FinalizeUploadRequest = components["schemas"]["FinalizeUploadRequest"];

export interface StartMediaUploadInput {
  body: Blob;
  fileName: string;
  sha256: string;
}

export async function startMediaUpload(
  client: APIClient,
  input: StartMediaUploadInput,
): Promise<Upload> {
  if (!(input.body instanceof Blob) || input.body.size < 1 || input.fileName.trim() === "" || input.sha256.trim() === "") {
    throw new Error("A non-empty media file, filename, and checksum are required.");
  }
  const response = await client.request("/media/uploads", {
    method: "POST",
    headers: {
      "Content-Type": input.body.type || "application/octet-stream",
      "Content-Length": String(input.body.size),
      "X-File-Name": input.fileName.trim(),
      "X-Content-SHA256": input.sha256.trim().toLowerCase(),
    },
    body: input.body,
  });
  return readJSON(response, "media upload", isUpload);
}

export async function finalizeMediaUpload(
  client: APIClient,
  uploadID: string,
  input: FinalizeUploadRequest,
): Promise<Asset> {
  const response = await client.request(`/media/uploads/${encodeURIComponent(uploadID)}/finalize`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return readJSON(response, "media asset", isAsset);
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

function isUpload(value: unknown): value is Upload {
  return isRecord(value) && hasText(value, "id") && hasText(value, "account_id") &&
    isNonNegativeInteger(value.declared_size) && /^[a-f0-9]{64}$/.test(String(value.expected_sha256)) &&
    hasText(value, "original_name") && hasText(value, "mime_type") && isUploadState(value.state) &&
    isPositiveInteger(value.version) && hasText(value, "expires_at") &&
    (value.asset_id === undefined || (typeof value.asset_id === "string" && value.asset_id !== ""));
}

function isAsset(value: unknown): value is Asset {
  return isRecord(value) && hasText(value, "id") && hasText(value, "account_id") &&
    hasText(value, "original_name") && hasText(value, "mime_type") && isNonNegativeInteger(value.byte_size) &&
    /^[a-f0-9]{64}$/.test(String(value.sha256)) && isPositiveInteger(value.version) &&
    hasText(value, "created_at") && hasText(value, "updated_at");
}

function isUploadState(value: unknown): boolean {
  return ["pending", "finalized", "failed", "expired"].includes(String(value));
}

function hasText(value: Record<string, unknown>, field: string): boolean {
  return typeof value[field] === "string" && value[field] !== "";
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
