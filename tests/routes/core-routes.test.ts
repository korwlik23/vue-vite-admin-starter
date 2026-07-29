import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";

import { createCoreRoutes } from "@/app/router/core-routes";

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
});
