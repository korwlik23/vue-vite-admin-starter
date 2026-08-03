import {
  listDiscoverabilityAudits,
  runDiscoverabilityAudit,
} from "@/modules/discoverability/api/audits.client";
import {
  createDiscoverabilityRedirect,
  deleteDiscoverabilityRedirect,
  listDiscoverabilityRedirects,
  updateDiscoverabilityRedirect,
} from "@/modules/discoverability/api/redirects.client";
import {
  getDiscoverabilitySEO,
  updateDiscoverabilitySEO,
} from "@/modules/discoverability/api/settings.client";
import { listLocales } from "@/modules/localization/api/locales.client";
import type { APIClient } from "@/shared/api/client";
import type { CMSRouteAdapter } from "@/app/router/cms/CMSRouteLoader.vue";

export function redirectsAdapter(client: APIClient): CMSRouteAdapter {
  return {
    initial: {
      redirects: [],
      create: (input: Parameters<typeof createDiscoverabilityRedirect>[1]) => createDiscoverabilityRedirect(client, input),
      update: ({ id, ...input }: Parameters<typeof updateDiscoverabilityRedirect>[2] & { id: string }) => updateDiscoverabilityRedirect(client, id, input),
      remove: ({ id, expected_version }: { id: string; expected_version: number }) => deleteDiscoverabilityRedirect(client, id, { expected_version }),
    },
    load: async () => ({ redirects: (await listDiscoverabilityRedirects(client, { limit: 100 })).items }),
  };
}

export function discoverabilityAdapter(client: APIClient): CMSRouteAdapter {
  let localeID = "";
  return {
    initial: {
      audits: [],
      seo: undefined,
      runAudit: (input: Parameters<typeof runDiscoverabilityAudit>[1]) => runDiscoverabilityAudit(client, input ?? { content_id: "", locale_id: localeID }),
      saveSEO: (input: Parameters<typeof updateDiscoverabilitySEO>[1]) => updateDiscoverabilitySEO(client, input),
    },
    load: async () => {
      const locales = (await listLocales(client)).items;
      const locale = locales.find((item) => item.default && item.enabled) ?? locales.find((item) => item.enabled) ?? locales[0];
      if (!locale) return { audits: [], seo: undefined };
      localeID = locale.id;
      const [seo, audits] = await Promise.all([
        getDiscoverabilitySEO(client, localeID),
        listDiscoverabilityAudits(client, { localeId: localeID, limit: 100 }),
      ]);
      return { seo, audits: audits.items };
    },
  };
}
