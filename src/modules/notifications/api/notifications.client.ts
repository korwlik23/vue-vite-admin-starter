import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  kind: string;
  read_at?: string | null;
  created_at: string;
}
export async function listNotifications(
  client: APIClient,
): Promise<Notification[]> {
  const response = await client.request("/notifications");
  if (!response.ok) throw await errorFromResponse(response);
  const body: unknown = await response.json();
  if (
    !isRecord(body) ||
    !Array.isArray(body.items) ||
    !body.items.every(isNotification)
  )
    throw new Error("Invalid notifications response");
  return body.items;
}
export async function markNotificationRead(
  client: APIClient,
  id: string,
): Promise<void> {
  const response = await client.request(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
  if (!response.ok) throw await errorFromResponse(response);
}
export async function markAllNotificationsRead(
  client: APIClient,
): Promise<void> {
  const response = await client.request("/notifications/read-all", {
    method: "POST",
  });
  if (!response.ok) throw await errorFromResponse(response);
}
function isNotification(value: unknown): value is Notification {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    typeof value.kind === "string" &&
    typeof value.created_at === "string"
  );
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
