import type { ModuleRegistry } from "@/app/modules/registry";

export function activateModules(
  registry: ModuleRegistry,
  enabledModuleIDs: readonly string[],
): string[] {
  const active: string[] = [];
  for (const id of new Set(enabledModuleIDs.toSorted())) {
    const module = registry.get(id);
    if (module === undefined) {
      continue;
    }
    module.activate();
    active.push(id);
  }
  return active;
}
