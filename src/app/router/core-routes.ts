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
import UsersView from "@/modules/identity/views/UsersView.vue";
import MembershipsView from "@/modules/accounts/views/MembershipsView.vue";
import AuditEventsView from "@/modules/audit/views/AuditEventsView.vue";
import ModulesView from "@/modules/operations/views/ModulesView.vue";
import LocalesView from "@/modules/localization/views/LocalesView.vue";
import CatalogEditorView from "@/modules/localization/views/CatalogEditorView.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import NotFoundState from "@/shared/components/feedback/NotFoundState.vue";
import type { APIClient } from "@/shared/api/client";
import { createCMSRoutes } from "./cms-routes";

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
  cms?: { client: APIClient };
  navigation?: () => readonly { id: string; label: string; href: string }[];
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
        navigationItems: dependencies.navigation?.(),
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
    children.push({
      path: "users",
      name: "identity-users",
      component: UsersView,
      props: () => ({ client: dependencies.authorization?.client }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "identity",
        requiredPermission: "identity.users.read.system",
      },
    });
    children.push({
      path: "accounts/memberships",
      name: "account-memberships",
      component: MembershipsView,
      props: () => ({
        client: dependencies.authorization?.client,
        accountID: dependencies.authorization?.accountID,
      }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "accounts",
        requiredPermission: "accounts.memberships.read.system",
      },
    });
    children.push({
      path: "audit/events",
      name: "audit-events",
      component: AuditEventsView,
      props: () => ({ client: dependencies.authorization?.client }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "audit",
        requiredPermission: "audit.events.read.system",
      },
    });
    children.push({
      path: "operations/modules",
      name: "operations-modules",
      component: ModulesView,
      props: () => ({ client: dependencies.authorization?.client }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "operations",
        requiredPermission: "operations.foundation.read.system",
      },
    });
    children.push({
      path: "localization/locales",
      name: "localization-locales",
      component: LocalesView,
      props: () => ({ client: dependencies.authorization?.client }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "localization",
        requiredPermission: "localization.locales.manage.system",
      },
    });
    children.push({
      path: "localization/catalog",
      name: "localization-catalog",
      component: CatalogEditorView,
      props: () => ({ client: dependencies.authorization?.client }),
      meta: {
        requiresAuthentication: true,
        requiredModule: "localization",
        requiredPermission: "localization.translations.update.system",
      },
    });
  }
  if (dependencies.cms !== undefined) {
    children.push(...createCMSRoutes(dependencies.cms));
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
