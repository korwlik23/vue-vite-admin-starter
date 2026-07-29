export function requireModule(
  enabledModuleIDs: readonly string[] | undefined,
  requiredModuleID: string,
): true | { name: "not-found" } {
  if (
    enabledModuleIDs === undefined ||
    !enabledModuleIDs.includes(requiredModuleID)
  ) {
    return { name: "not-found" };
  }
  return true;
}
