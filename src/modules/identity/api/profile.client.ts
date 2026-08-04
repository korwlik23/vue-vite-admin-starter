import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";
export interface UserProfile {
  user_id: string;
  display_name: string;
  timezone: string;
  preferred_locale: string;
  version: number;
  created_at: string;
  updated_at: string;
}
export async function getMyProfile(client: APIClient): Promise<UserProfile> {
  const response = await client.request("/me/profile");
  if (!response.ok) throw await errorFromResponse(response);
  const body: unknown = await response.json();
  if (!isProfile(body)) throw new Error("Invalid profile response");
  return body;
}
export async function updateMyProfile(
  client: APIClient,
  profile: Pick<UserProfile, "display_name" | "timezone" | "preferred_locale">,
  expectedVersion: number,
): Promise<UserProfile> {
  const response = await client.request("/me/profile", {
    method: "PATCH",
    body: JSON.stringify({ ...profile, expected_version: expectedVersion }),
  });
  if (!response.ok) throw await errorFromResponse(response);
  const body: unknown = await response.json();
  if (!isProfile(body)) throw new Error("Invalid profile response");
  return body;
}
export async function changeMyPassword(
  client: APIClient,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await client.request("/me/password", {
    method: "PATCH",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  if (!response.ok) throw await errorFromResponse(response);
  if (response.status !== 204)
    throw new Error("Invalid password change response");
}
function isProfile(value: unknown): value is UserProfile {
  return (
    isRecord(value) &&
    typeof value.user_id === "string" &&
    typeof value.display_name === "string" &&
    typeof value.timezone === "string" &&
    typeof value.preferred_locale === "string" &&
    typeof value.version === "number" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
