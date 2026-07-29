import { createRouter, createWebHistory, type Router } from "vue-router";

import {
  createCoreRoutes,
  type CoreRouteDependencies,
} from "@/app/router/core-routes";

export function createAppRouter(
  dependencies: CoreRouteDependencies,
): Router {
  return createRouter({
    history: createWebHistory(),
    routes: createCoreRoutes(dependencies),
    scrollBehavior: () => ({ top: 0 }),
  });
}
