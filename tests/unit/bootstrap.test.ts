import { describe, expect, it, vi } from "vitest";

import { runBootstrapLifecycle } from "@/app/bootstrap";

describe("U14B", () => {
  it("loads protected capabilities only after an authenticated session", async () => {
    const order: string[] = [];
    const result = await runBootstrapLifecycle({
      loadConfig: () => {
        order.push("config");
        return { apiBaseUrl: "https://api.example.test", appName: "Admin" };
      },
      createClient: () => {
        order.push("client");
        return {};
      },
      registerPublicRoutes: () => order.push("public-routes"),
      getSession: async () => {
        order.push("session");
        return { state: "authenticated" as const };
      },
      getEnabledModules: async () => {
        order.push("modules");
        return ["operations"];
      },
      getPermissions: async () => {
        order.push("permissions");
        return ["operations.foundation.read.system"];
      },
      activateProtectedRoutes: (modules) => {
        order.push(`activate:${modules.join(",")}`);
      },
    });

    expect(order).toEqual([
      "config",
      "client",
      "public-routes",
      "session",
      "modules",
      "permissions",
      "activate:operations",
    ]);
    expect(result.permissions).toEqual([
      "operations.foundation.read.system",
    ]);
  });

  it("does not query protected endpoints for an anonymous session", async () => {
    const getEnabledModules = vi.fn();
    const getPermissions = vi.fn();
    await runBootstrapLifecycle({
      loadConfig: () => ({
        apiBaseUrl: "https://api.example.test",
        appName: "Admin",
      }),
      createClient: () => ({}),
      registerPublicRoutes: vi.fn(),
      getSession: async () => undefined,
      getEnabledModules,
      getPermissions,
      activateProtectedRoutes: vi.fn(),
    });

    expect(getEnabledModules).not.toHaveBeenCalled();
    expect(getPermissions).not.toHaveBeenCalled();
  });
});
