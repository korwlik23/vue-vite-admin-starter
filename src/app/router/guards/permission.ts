import { hasPermission } from "@/shared/permissions/permissions";

export function requirePermission(
  permissions: readonly string[] | undefined,
  required: string,
): true | { name: "forbidden" } {
  return hasPermission(permissions, required) ? true : { name: "forbidden" };
}
