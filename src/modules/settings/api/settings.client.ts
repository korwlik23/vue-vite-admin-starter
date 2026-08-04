import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export interface Setting {
  key: string;
  value: string;
  version: number;
}

export async function listSettings(client: APIClient): Promise<Setting[]> {
  const response = await client.request("/settings");
  if (!response.ok) throw await errorFromResponse(response);
  const body: unknown = await response.json();
  if (
    !isRecord(body) ||
    !Array.isArray(body.items) ||
    !body.items.every(isSetting)
  )
    throw new Error("Invalid settings response");
  return body.items;
}

export async function updateSetting(
  client: APIClient,
  key: string,
  value: string,
  expectedVersion: number,
): Promise<Setting> {
  const response = await client.request(
    `/settings/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      body: JSON.stringify({ value, expected_version: expectedVersion }),
    },
  );
  if (!response.ok) throw await errorFromResponse(response);
  const body: unknown = await response.json();
  if (!isSetting(body)) throw new Error("Invalid setting response");
  return body;
}

function isSetting(value: unknown): value is Setting {
  return (
    isRecord(value) &&
    typeof value.key === "string" &&
    typeof value.value === "string" &&
    typeof value.version === "number"
  );
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
