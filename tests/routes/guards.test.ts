import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";

import { requireAuthentication } from "@/app/router/guards/auth";
import { installAccessGuards } from "@/app/router/guards/access";
import { requireModule } from "@/app/router/guards/module";
import { requirePermission } from "@/app/router/guards/permission";

describe("U10", () => {
  it("redirects unauthenticated users to login with a safe return path", () => {
    expect(requireAuthentication(false, "/settings/locales")).toEqual({
      name: "login",
      query: { returnTo: "/settings/locales" },
    });
  });

  it("maps missing permissions to 403 and disabled modules to 404", () => {
    expect(
      requirePermission(
        ["localization.locales.read.system"],
        "localization.locales.manage.system",
      ),
    ).toEqual({ name: "forbidden" });
    expect(requireModule(["operations"], "localization")).toEqual({
      name: "not-found",
    });
  });

  it("allows enabled routes with an exact permission", () => {
    expect(
      requirePermission(
        ["localization.locales.manage.system"],
        "localization.locales.manage.system",
      ),
    ).toBe(true);
    expect(requireModule(["localization"], "localization")).toBe(true);
  });

  it("enforces live authentication, module, and permission state on protected routes", async () => {
    const state = {
      authenticated: false,
      mfaPending: false,
      modules: [] as string[],
      permissions: [] as string[],
    };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/login", name: "login", component: {} },
        { path: "/mfa", name: "mfa", component: {} },
        { path: "/403", name: "forbidden", component: {} },
        { path: "/404", name: "not-found", component: {} },
        {
          path: "/",
          name: "foundation",
          component: {},
          meta: {
            requiresAuthentication: true,
            requiredModule: "operations",
            requiredPermission: "operations.foundation.read.system",
          },
        },
      ],
    });
    installAccessGuards(router, {
      isAuthenticated: () => state.authenticated,
      isMfaPending: () => state.mfaPending,
      enabledModuleIDs: () => state.modules,
      permissions: () => state.permissions,
    });

    await router.push("/");
    expect(router.currentRoute.value.name).toBe("login");

    state.authenticated = true;
    await router.push("/");
    expect(router.currentRoute.value.name).toBe("not-found");

    state.modules = ["operations"];
    await router.push("/");
    expect(router.currentRoute.value.name).toBe("forbidden");

    state.permissions = ["operations.foundation.read.system"];
    await router.push("/");
    expect(router.currentRoute.value.name).toBe("foundation");
  });
});
