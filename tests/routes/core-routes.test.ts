import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";

import { createCoreRoutes } from "@/app/router/core-routes";
import type { APIClient } from "@/shared/api/client";

describe("U14A", () => {
  it("wires public, forbidden, missing, and authenticated shell routes", () => {
    const routes = createCoreRoutes({
      login: {
        authenticated: false,
        submit: vi.fn(),
      },
      mfa: {
        pending: false,
        methods: [],
        refreshCSRF: vi.fn(),
        submit: vi.fn(),
      },
      foundation: {
        state: "loading",
        retry: vi.fn(),
      },
    });
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    expect(router.resolve("/login").name).toBe("login");
    expect(router.resolve("/mfa").name).toBe("mfa");
    expect(router.resolve("/403").name).toBe("forbidden");
    expect(router.resolve("/missing").name).toBe("not-found");
    expect(router.resolve("/").name).toBe("foundation");
    expect(routes.some((route) => route.path.includes(":locale"))).toBe(false);
  });

  it("adds the permission-protected role administration route when authorization is active", () => {
    const client = { request: vi.fn() } as unknown as APIClient;
    const routes = createCoreRoutes({
      login: { authenticated: false, submit: vi.fn() },
      mfa: { pending: false, methods: [], refreshCSRF: vi.fn(), submit: vi.fn() },
      foundation: { state: "loading", retry: vi.fn() },
      authorization: { client },
    });
    const router = createRouter({ history: createMemoryHistory(), routes });
    const resolved = router.resolve("/authorization/roles");

    expect(resolved.name).toBe("authorization-roles");
    expect(resolved.meta).toMatchObject({
      requiresAuthentication: true,
      requiredModule: "authorization",
      requiredPermission: "authorization.roles.read.system",
    });
  });

  it("keeps audit and localization screens behind explicit permissions", () => {
    const client = { request: vi.fn() } as unknown as APIClient;
    const routes = createCoreRoutes({
      login: { authenticated: false, submit: vi.fn() },
      mfa: { pending: false, methods: [], refreshCSRF: vi.fn(), submit: vi.fn() },
      foundation: { state: "loading", retry: vi.fn() },
      authorization: { client },
    });
    const router = createRouter({ history: createMemoryHistory(), routes });

    expect(router.resolve("/audit/events").meta).toMatchObject({
      requiredModule: "audit", requiredPermission: "audit.events.read.system",
    });
    expect(router.resolve("/localization/catalog").meta).toMatchObject({
      requiredModule: "localization", requiredPermission: "localization.translations.update.system",
    });
  });
});
