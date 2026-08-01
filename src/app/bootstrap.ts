import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "@/App.vue";
import { createModuleRegistry } from "@/app/modules/registry";
import { moduleManifest } from "@/app/modules/manifest";
import { activateModules } from "@/app/modules/activate";
import { createQueryClient } from "@/app/query-client";
import { createAppRouter } from "@/app/router";
import {
  loadRuntimeConfig,
  type RuntimeConfig,
} from "@/app/runtime-config";
import { getEffectivePermissions } from "@/modules/authorization/api/permissions.client";
import { createAuthClient } from "@/modules/identity/api/auth.client";
import { listEnabledModules } from "@/modules/operations/api/modules.client";
import { createAPIClient } from "@/shared/api/client";
import { createCSRFTokenProvider } from "@/shared/api/csrf";
import { errorFromResponse } from "@/shared/api/errors";

interface BootstrapSession {
  state: "authenticated";
}

export interface BootstrapLifecycleDependencies<Config, Client, Session> {
  loadConfig(): Config;
  createClient(config: Config): Client;
  registerPublicRoutes(client: Client): void;
  getSession(client: Client): Promise<Session | undefined>;
  getEnabledModules(client: Client): Promise<string[]>;
  getPermissions(client: Client): Promise<string[]>;
  activateProtectedRoutes(moduleIDs: string[], permissions: string[]): void;
}

export async function runBootstrapLifecycle<Config, Client>(
  dependencies: BootstrapLifecycleDependencies<
    Config,
    Client,
    BootstrapSession
  >,
): Promise<{
  config: Config;
  client: Client;
  session: BootstrapSession | undefined;
  moduleIDs: string[];
  permissions: string[];
}> {
  const config = dependencies.loadConfig();
  const client = dependencies.createClient(config);
  dependencies.registerPublicRoutes(client);
  const session = await dependencies.getSession(client);
  let moduleIDs: string[] = [];
  let permissions: string[] = [];
  if (session?.state === "authenticated") {
    moduleIDs = await dependencies.getEnabledModules(client);
    permissions = await dependencies.getPermissions(client);
    dependencies.activateProtectedRoutes(moduleIDs, permissions);
  }
  return { config, client, session, moduleIDs, permissions };
}

export async function bootstrapAdmin(target = "#app"): Promise<void> {
  const config = loadRuntimeConfig();
  const csrf = createCSRFTokenProvider(config.apiBaseUrl);
  const client = createAPIClient({ baseUrl: config.apiBaseUrl, csrf });
  const auth = createAuthClient(client);
  const session = await auth.currentSession();
  let enabledModuleIDs: string[] = [];
  let permissions: string[] = [];
  const accessState = {
    authenticated: session !== undefined,
    mfaPending: false,
  };

  async function refreshProtectedCapabilities(): Promise<void> {
    const modules = await listEnabledModules(client);
    enabledModuleIDs = modules.filter((item) => item.enabled).map((item) => item.id);
    permissions = (await getEffectivePermissions(client)).permissions;
    activateModules(createModuleRegistry(moduleManifest), enabledModuleIDs);
  }

  if (accessState.authenticated) {
    await refreshProtectedCapabilities();
  }

  const router = createAppRouter({
    login: {
      authenticated: () => accessState.authenticated,
      submit: async (input) => {
        const result = await auth.login(input);
        accessState.mfaPending = result.status === "mfa_pending";
        if (result.status === "authenticated") {
          accessState.authenticated = true;
          await refreshProtectedCapabilities();
        }
        return result;
      },
    },
    mfa: {
      pending: () => accessState.mfaPending,
      methods: ["totp", "recovery_code"],
      refreshCSRF: async () => {
        csrf.clear();
        return csrf.token();
      },
      submit: async (input) => {
        const response = await client.request("/auth/mfa/verify", {
          method: "POST",
          body: JSON.stringify(input),
        });
        if (!response.ok) {
          throw await errorFromResponse(response);
        }
        accessState.mfaPending = false;
        accessState.authenticated = true;
        await refreshProtectedCapabilities();
      },
    },
    foundation: {
      state: () => (accessState.authenticated ? "success" : "loading"),
      selectedLocale: "",
      enabledModules: () => enabledModuleIDs,
      retry: () => globalThis.location.reload(),
    },
    authorization: { client },
  }, {
    isAuthenticated: () => accessState.authenticated,
    isMfaPending: () => accessState.mfaPending,
    enabledModuleIDs: () => enabledModuleIDs,
    permissions: () => permissions,
  });
  createApp(App)
    .use(createPinia())
    .use(VueQueryPlugin, { queryClient: createQueryClient() })
    .use(router)
    .mount(target);
}

export function createClientForConfig(config: RuntimeConfig) {
  const csrf = createCSRFTokenProvider(config.apiBaseUrl);
  return createAPIClient({ baseUrl: config.apiBaseUrl, csrf });
}
