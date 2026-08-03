import type { RouteLocationNormalizedLoaded } from "vue-router";

import {
  deleteNavigationMenu,
  getNavigationMenu,
  listNavigationMenus,
  updateNavigationMenu,
  type Menu,
} from "@/modules/navigation/api/menus.client";
import type { APIClient } from "@/shared/api/client";
import type { CMSRouteAdapter } from "@/app/router/cms/CMSRouteLoader.vue";

type CMSRoute = RouteLocationNormalizedLoaded;

const emptyMenu: Menu = {
  account_id: "",
  created_at: "",
  enabled: false,
  id: "",
  items: [],
  key: "",
  locale_id: "",
  name: "Menu",
  updated_at: "",
  version: 1,
};

function localeIDFromRoute(route: CMSRoute): string | undefined {
  const value = route.query.locale_id;
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function menuListAdapter(client: APIClient, route: CMSRoute): CMSRouteAdapter {
  return {
    initial: { menus: [] },
    load: async () => {
      const localeID = localeIDFromRoute(route);
      const query = localeID === undefined ? { limit: 100 } : { localeId: localeID, limit: 100 };
      return { menus: (await listNavigationMenus(client, query)).items };
    },
  };
}

export function menuEditorAdapter(client: APIClient, route: CMSRoute): CMSRouteAdapter {
  const menuID = String(route.params.menuID ?? "");
  return {
    initial: {
      menu: emptyMenu,
      save: (input: Parameters<typeof updateNavigationMenu>[2]) => updateNavigationMenu(client, menuID, input),
      remove: (input: { id: string; expected_version: number }) => deleteNavigationMenu(client, input.id, { expected_version: input.expected_version }),
    },
    load: async () => ({ menu: await getNavigationMenu(client, menuID) }),
  };
}
