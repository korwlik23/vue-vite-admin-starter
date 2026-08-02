import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type PublishingSchedule = components["schemas"]["Schedule"];
export type PublishingScheduleList = components["schemas"]["ScheduleListResponse"];
export type ScheduleRequest = components["schemas"]["ScheduleRequest"];

export interface PublishingScheduleQuery {
  limit?: number;
}

export async function listPublishingSchedules(
  client: APIClient,
  query: PublishingScheduleQuery = {},
): Promise<PublishingScheduleList> {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  const suffix = params.toString();
  const response = await client.request(
    `/publishing/schedules${suffix === "" ? "" : `?${suffix}`}`,
  );
  return readJSON(response, "publishing schedule list", isScheduleList);
}

export async function createPublishingSchedule(
  client: APIClient,
  input: ScheduleRequest,
): Promise<PublishingSchedule> {
  const response = await client.request("/publishing/schedules", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return readJSON(response, "publishing schedule", isSchedule);
}

export async function cancelPublishingSchedule(
  client: APIClient,
  scheduleID: string,
): Promise<void> {
  const response = await client.request(
    `/publishing/schedules/${encodeURIComponent(scheduleID)}`,
    { method: "DELETE" },
  );
  if (!response.ok) throw await errorFromResponse(response);
  if (response.status !== 204) {
    throw new Error("Invalid publishing schedule cancellation response");
  }
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

function isScheduleList(value: unknown): value is PublishingScheduleList {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isSchedule);
}

function isSchedule(value: unknown): value is PublishingSchedule {
  return (
    isRecord(value) &&
    hasText(value, "id") &&
    hasText(value, "account_id") &&
    hasText(value, "translation_id") &&
    hasText(value, "publish_at") &&
    isPositiveInteger(value.expected_version) &&
    hasText(value, "idempotency_key") &&
    isScheduleState(value.state) &&
    isNonNegativeInteger(value.attempts) &&
    (value.unpublish_at === undefined || value.unpublish_at === null || typeof value.unpublish_at === "string")
  );
}

function isScheduleState(value: unknown): boolean {
  return ["pending", "leased", "succeeded", "failed", "canceled"].includes(String(value));
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
