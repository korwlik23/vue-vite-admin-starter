import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

type ModuleState = components["schemas"]["ModuleState"];

export async function listEnabledModules(
  client: APIClient,
): Promise<ModuleState[]> {
  const response = await client.request("/operations/modules");
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const body: unknown = await response.json();
  if (
    !isRecord(body) ||
    !Array.isArray(body.items) ||
    !body.items.every(isModuleState)
  ) {
    throw new Error("Invalid enabled module response");
  }
  return body.items;
}

function isModuleState(value: unknown): value is ModuleState {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.enabled === "boolean" &&
    typeof value.reconcile_revision === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
