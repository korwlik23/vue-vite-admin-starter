import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type AuditEvent = components["schemas"]["AuditEvent"];
export type AuditEventList = components["schemas"]["AuditEventListResponse"];
export interface AuditEventQuery { cursor?: string; limit?: number; action?: string; actorID?: string }

export async function listAuditEvents(client: APIClient, query: AuditEventQuery = {}): Promise<AuditEventList> {
  const params = new URLSearchParams();
  if (query.cursor !== undefined) params.set("cursor", query.cursor);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.action !== undefined) params.set("action", query.action);
  if (query.actorID !== undefined) params.set("actor_id", query.actorID);
  const suffix = params.toString();
  const response = await client.request(`/audit/events${suffix === "" ? "" : `?${suffix}`}`);
  if (!response.ok) throw await errorFromResponse(response);
  let body: unknown; try { body = await response.json(); } catch { throw new Error("Invalid audit event response"); }
  if (!isAuditEventList(body)) throw new Error("Invalid audit event response");
  return body;
}

function isAuditEventList(value: unknown): value is AuditEventList { return isRecord(value) && Array.isArray(value.items) && value.items.every(isAuditEvent) && (value.next_cursor === undefined || value.next_cursor === null || typeof value.next_cursor === "string"); }
function isAuditEvent(value: unknown): value is AuditEvent { return isRecord(value) && typeof value.id === "string" && typeof value.scope === "string" && typeof value.actor_type === "string" && typeof value.action === "string" && typeof value.operation_id === "string" && typeof value.occurred_at === "string" && typeof value.recorded_at === "string" && isRecord(value.data); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
