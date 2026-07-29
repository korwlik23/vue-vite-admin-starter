import type { Router } from "vue-router";

import { requireAuthentication } from "./auth";
import { requireModule } from "./module";
import { requirePermission } from "./permission";

export interface RouterAccessState {
  isAuthenticated(): boolean;
  isMfaPending(): boolean;
  enabledModuleIDs(): readonly string[] | undefined;
  permissions(): readonly string[] | undefined;
}

export function installAccessGuards(
  router: Router,
  access: RouterAccessState,
): void {
  router.beforeEach((to) => {
    if (to.name === "login" && access.isAuthenticated()) {
      return { name: "foundation" };
    }
    if (to.name === "mfa") {
      return access.isMfaPending() ? true : { name: "login" };
    }
    if (!to.meta.requiresAuthentication) {
      return true;
    }

    const authenticated = requireAuthentication(access.isAuthenticated(), to.fullPath);
    if (authenticated !== true) return authenticated;

    const requiredModule = stringMeta(to.meta.requiredModule);
    if (requiredModule) {
      const moduleAllowed = requireModule(access.enabledModuleIDs(), requiredModule);
      if (moduleAllowed !== true) return moduleAllowed;
    }

    const requiredPermission = stringMeta(to.meta.requiredPermission);
    if (requiredPermission) {
      return requirePermission(access.permissions(), requiredPermission);
    }
    return true;
  });
}

function stringMeta(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}
