import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

type EffectivePermissions =
  components["schemas"]["EffectivePermissionsResponse"];

export async function getEffectivePermissions(
  client: APIClient,
): Promise<EffectivePermissions> {
  const response = await client.request(
    "/authorization/effective-permissions",
  );
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const body: unknown = await response.json();
  if (
    !isRecord(body) ||
    typeof body.account_id !== "string" ||
    !Array.isArray(body.permissions) ||
    !body.permissions.every((permission) => typeof permission === "string")
  ) {
    throw new Error("Invalid effective permissions response");
  }
  return {
    account_id: body.account_id,
    permissions: body.permissions,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
