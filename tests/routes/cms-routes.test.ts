import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";

import { createCMSRoutes } from "@/app/router/cms-routes";
import { installAccessGuards } from "@/app/router/guards/access";
import type { APIClient } from "@/shared/api/client";

describe("D5", () => {
  it("registers each CMS bounded context with an exact module and permission", () => {
    const routes = createCMSRoutes({ client: { request: vi.fn() } as unknown as APIClient });
    const media = routes.find((route) => route.name === "media-library");
    const publishing = routes.find((route) => route.name === "publishing-content");
    expect(media?.meta).toMatchObject({ requiredModule: "media", requiredPermission: "media.assets.read.own" });
    expect(publishing?.meta).toMatchObject({ requiredModule: "publishing", requiredPermission: "publishing.pages.read.own" });
    expect(routes.some((route) => route.path.includes(":locale"))).toBe(false);
  });

  it("returns 404 for a disabled module and 403 for a missing permission", async () => {
    const routes = createCMSRoutes({ client: { request: vi.fn() } as unknown as APIClient });
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/", children: routes }, { path: "/403", name: "forbidden", component: {} }, { path: "/:pathMatch(.*)*", name: "not-found", component: {} }] });
    const state = { modules: [] as string[], permissions: [] as string[] };
    installAccessGuards(router, { isAuthenticated: () => true, isMfaPending: () => false, enabledModuleIDs: () => state.modules, permissions: () => state.permissions });
    await router.push("/media");
    expect(router.currentRoute.value.name).toBe("not-found");
    state.modules = ["media"];
    await router.push("/media");
    expect(router.currentRoute.value.name).toBe("forbidden");
  });
});
