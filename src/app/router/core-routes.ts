import type { RouteRecordRaw } from "vue-router";

import AdminRouteShell from "@/app/layouts/AdminRouteShell.vue";
import MfaChallengeView from "@/modules/identity/views/MfaChallengeView.vue";
import LoginView from "@/modules/identity/views/LoginView.vue";
import type {
  LoginInput,
  LoginResult,
  MFAMethod,
} from "@/modules/identity/types";
import FoundationStatusView from "@/modules/operations/views/FoundationStatusView.vue";
import RoleAdministrationView from "@/modules/authorization/views/RoleAdministrationView.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import NotFoundState from "@/shared/components/feedback/NotFoundState.vue";
import type { APIClient } from "@/shared/api/client";

export interface CoreRouteDependencies {
  login: {
    authenticated: boolean | (() => boolean);
    submit: (input: LoginInput) => Promise<LoginResult>;
    navigate?: (path: string) => Promise<unknown> | unknown;
  };
  mfa: {
    pending: boolean | (() => boolean);
    methods: MFAMethod[];
    refreshCSRF: () => Promise<string>;
    submit: (input: {
      method: MFAMethod;
      code: string;
    }) => Promise<unknown> | unknown;
    verified?: () => Promise<unknown> | unknown;
  };
  foundation: {
    state: "loading" | "error" | "success" | (() => "loading" | "error" | "success");
    account?: { name: string; slug: string } | undefined;
    selectedLocale?: string;
    enabledModules?: string[] | (() => string[]);
    retry: () => void;
  };
  authorization?: {
    client: APIClient;
    accountID?: string | (() => string | undefined);
  };
}

export function createCoreRoutes(
  dependencies: CoreRouteDependencies,
): RouteRecordRaw[] {
  const children: RouteRecordRaw[] = [
    {
      path: "",
      name: "foundation",
      component: FoundationStatusView,
      props: () => ({
        ...dependencies.foundation,
        state: resolveValue(dependencies.foundation.state),
        enabledModules:
          typeof dependencies.foundation.enabledModules === "function"
            ? dependencies.foundation.enabledModules()
            : dependencies.foundation.enabledModules,
      }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "operations",
        requiredPermission: "operations.foundation.read.system",
      },
    },
  ];
  if (dependencies.authorization !== undefined) {
    children.push({
      path: "authorization/roles",
      name: "authorization-roles",
      component: RoleAdministrationView,
      props: () => ({
        client: dependencies.authorization?.client,
        accountID: dependencies.authorization?.accountID,
      }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "authorization",
        requiredPermission: "authorization.roles.read.system",
      },
    });
  }
  return [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      props: (route) => ({
        ...dependencies.login,
        authenticated: resolveValue(dependencies.login.authenticated),
        returnTo:
          typeof route.query.returnTo === "string" ? route.query.returnTo : "/",
      }),
    },
    {
      path: "/mfa",
      name: "mfa",
      component: MfaChallengeView,
      props: () => ({
        ...dependencies.mfa,
        pending: resolveValue(dependencies.mfa.pending),
      }),
    },
    {
      path: "/403",
      name: "forbidden",
      component: ForbiddenState,
    },
    {
      path: "/",
      component: AdminRouteShell,
      children,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundState,
    },
  ];
}

function resolveValue<T>(value: T | (() => T)): T {
  return typeof value === "function" ? (value as () => T)() : value;
}
