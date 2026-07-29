import { createRouter, createWebHistory, type Router } from "vue-router";

import {
  createCoreRoutes,
  type CoreRouteDependencies,
} from "@/app/router/core-routes";
import {
  installAccessGuards,
  type RouterAccessState,
} from "@/app/router/guards/access";

export function createAppRouter(
  dependencies: CoreRouteDependencies,
  access: RouterAccessState = {
    isAuthenticated: () => false,
    isMfaPending: () => false,
    enabledModuleIDs: () => undefined,
    permissions: () => undefined,
  },
): Router {
  const routerReference: { current?: Router } = {};
  const routes = createCoreRoutes({
    ...dependencies,
    login: {
      ...dependencies.login,
      navigate: (path) => requireRouter(routerReference).push(path),
    },
    mfa: {
      ...dependencies.mfa,
      verified: () => requireRouter(routerReference).push({ name: "foundation" }),
    },
  });
  const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
  });
  routerReference.current = router;
  installAccessGuards(router, access);
  return router;
}

function requireRouter(reference: { current?: Router }): Router {
  if (!reference.current) {
    throw new Error("Router navigation is not initialized");
  }
  return reference.current;
}
