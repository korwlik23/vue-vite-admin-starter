import type { RouteRecordRaw } from "vue-router";

import AdminRouteShell from "@/app/layouts/AdminRouteShell.vue";
import type { components } from "@/generated/api/schema";
import MfaChallengeView from "@/modules/identity/views/MfaChallengeView.vue";
import LoginView from "@/modules/identity/views/LoginView.vue";
import FoundationStatusView from "@/modules/operations/views/FoundationStatusView.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import NotFoundState from "@/shared/components/feedback/NotFoundState.vue";

type LoginInput = components["schemas"]["LoginRequest"];
type LoginResult =
  | components["schemas"]["LoginAuthenticatedResponse"]
  | components["schemas"]["LoginMFAPendingResponse"];
type MFAMethod = "totp" | "recovery_code";

export interface CoreRouteDependencies {
  login: {
    authenticated: boolean;
    submit: (input: LoginInput) => Promise<LoginResult>;
  };
  mfa: {
    pending: boolean;
    methods: MFAMethod[];
    refreshCSRF: () => Promise<string>;
    submit: (input: {
      method: MFAMethod;
      code: string;
    }) => Promise<unknown> | unknown;
  };
  foundation: {
    state: "loading" | "error" | "success";
    account?: { name: string; slug: string } | undefined;
    selectedLocale?: string;
    enabledModules?: string[];
    retry: () => void;
  };
}

export function createCoreRoutes(
  dependencies: CoreRouteDependencies,
): RouteRecordRaw[] {
  return [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      props: (route) => ({
        ...dependencies.login,
        returnTo:
          typeof route.query.returnTo === "string" ? route.query.returnTo : "/",
      }),
    },
    {
      path: "/mfa",
      name: "mfa",
      component: MfaChallengeView,
      props: dependencies.mfa,
    },
    {
      path: "/403",
      name: "forbidden",
      component: ForbiddenState,
    },
    {
      path: "/",
      component: AdminRouteShell,
      children: [
        {
          path: "",
          name: "foundation",
          component: FoundationStatusView,
          props: dependencies.foundation,
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundState,
    },
  ];
}
