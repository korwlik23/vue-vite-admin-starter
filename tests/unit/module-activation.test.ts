import { describe, expect, it, vi } from "vitest";

import { activateModules } from "@/app/modules/activate";
import { createModuleRegistry } from "@/app/modules/registry";

describe("U9", () => {
  it("registers only locally known modules enabled by the API", () => {
    const operations = vi.fn();
    const localization = vi.fn();
    const registry = createModuleRegistry([
      { id: "operations", activate: operations },
      { id: "localization", activate: localization },
    ]);

    const active = activateModules(registry, [
      "operations",
      "unknown-server-module",
    ]);

    expect(active).toEqual(["operations"]);
    expect(operations).toHaveBeenCalledOnce();
    expect(localization).not.toHaveBeenCalled();
  });
});
