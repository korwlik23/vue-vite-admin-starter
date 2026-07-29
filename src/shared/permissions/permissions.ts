export type PermissionCollection =
  | ReadonlySet<string>
  | readonly string[]
  | undefined;

const permissionPattern =
  /^[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*\.(?:own|any|system)$/;

export function hasPermission(
  permissions: PermissionCollection,
  required: string,
): boolean {
  if (!permissionPattern.test(required) || permissions === undefined) {
    return false;
  }
  return Array.isArray(permissions)
    ? permissions.includes(required)
    : (permissions as ReadonlySet<string>).has(required);
}
