import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type WorkflowRequest = components["schemas"]["WorkflowRequest"];
export type WorkflowResponse = components["schemas"]["WorkflowResponse"];

export async function transitionPublishingWorkflow(
  client: APIClient,
  contentID: string,
  input: WorkflowRequest,
): Promise<WorkflowResponse> {
  const response = await client.request(
    `/publishing/content/${encodeURIComponent(contentID)}/workflow`,
    { method: "POST", body: JSON.stringify(input) },
  );
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Invalid publishing workflow response");
  }
  if (!isWorkflowResponse(body)) {
    throw new Error("Invalid publishing workflow response");
  }
  return body;
}

function isWorkflowResponse(value: unknown): value is WorkflowResponse {
  return (
    isRecord(value) &&
    hasText(value, "content_id") &&
    hasText(value, "translation_id") &&
    isStatus(value.content_status) &&
    isStatus(value.translation_status) &&
    isPositiveInteger(value.content_version) &&
    isPositiveInteger(value.translation_version)
  );
}

function isStatus(value: unknown): boolean {
  return ["draft", "review", "published", "scheduled", "archived"].includes(String(value));
}

function hasText(value: Record<string, unknown>, field: string): boolean {
  return typeof value[field] === "string" && value[field] !== "";
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
