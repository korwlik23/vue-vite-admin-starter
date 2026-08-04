import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";
export interface OperationJob {
  id: string;
  name: string;
  payload: Record<string, unknown>;
  state: "queued" | "running" | "failed" | "done";
  attempts: number;
  last_error?: string | null;
  created_at: string;
  updated_at: string;
}
export async function listOperationJobs(
  client: APIClient,
): Promise<OperationJob[]> {
  const response = await client.request("/operations/jobs");
  if (!response.ok) throw await errorFromResponse(response);
  const body: unknown = await response.json();
  if (!isRecord(body) || !Array.isArray(body.items) || !body.items.every(isJob))
    throw new Error("Invalid jobs response");
  return body.items;
}
export async function enqueueOperationJob(
  client: APIClient,
  name: string,
  payload: Record<string, unknown>,
): Promise<OperationJob> {
  const response = await client.request("/operations/jobs", {
    method: "POST",
    body: JSON.stringify({ name, payload }),
  });
  if (!response.ok) throw await errorFromResponse(response);
  const body: unknown = await response.json();
  if (!isJob(body)) throw new Error("Invalid job response");
  return body;
}
export async function retryOperationJob(
  client: APIClient,
  id: string,
): Promise<void> {
  const response = await client.request(
    `/operations/jobs/${encodeURIComponent(id)}/retry`,
    { method: "POST" },
  );
  if (!response.ok) throw await errorFromResponse(response);
}
function isJob(value: unknown): value is OperationJob {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.state === "string" &&
    typeof value.attempts === "number" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    isRecord(value.payload)
  );
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
