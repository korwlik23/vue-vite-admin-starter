import type { AdminModule } from "@/app/modules/manifest";

export type ModuleRegistry = ReadonlyMap<string, AdminModule>;

const moduleIDPattern = /^[a-z][a-z0-9_-]*$/;

export function createModuleRegistry(
  modules: readonly AdminModule[],
): ModuleRegistry {
  const registry = new Map<string, AdminModule>();
  for (const module of modules) {
    if (
      !moduleIDPattern.test(module.id) ||
      registry.has(module.id) ||
      typeof module.activate !== "function"
    ) {
      throw new Error("Invalid Admin module registry");
    }
    registry.set(module.id, module);
  }
  return registry;
}
