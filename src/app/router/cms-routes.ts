import type { RouteRecordRaw } from "vue-router";

import ContentEditor from "@/modules/publishing/views/ContentEditor.vue";
import ContentList from "@/modules/publishing/views/ContentList.vue";
import ReviewQueue from "@/modules/publishing/views/ReviewQueue.vue";
import RevisionHistory from "@/modules/publishing/views/RevisionHistory.vue";
import ScheduleView from "@/modules/publishing/views/ScheduleView.vue";
import MediaLibraryView from "@/modules/media/views/MediaLibraryView.vue";
import MenuEditorView from "@/modules/navigation/views/MenuEditorView.vue";
import MenuListView from "@/modules/navigation/views/MenuListView.vue";
import RedirectsView from "@/modules/discoverability/views/RedirectsView.vue";
import DiscoverabilityView from "@/modules/discoverability/views/DiscoverabilityView.vue";
import type { APIClient } from "@/shared/api/client";
import type { Menu } from "@/modules/navigation/api/menus.client";
import type { SEODefaults } from "@/modules/discoverability/api/settings.client";

export interface CMSRouteDependencies {
  client: APIClient;
}

export function createCMSRoutes(_dependencies: CMSRouteDependencies): RouteRecordRaw[] {
  void _dependencies;
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
  const emptySEO: SEODefaults = {
    id: "",
    account_id: "",
    locale_id: "",
    title: "",
    description: "",
    canonical_base: "https://example.invalid",
    robots: "index,follow",
    version: 1,
    created_at: "",
    updated_at: "",
  };
  const unavailable = async (): Promise<never> => {
    throw new Error("CMS route data provider is not configured");
  };

  return [
    route("publishing-content", "publishing/content", ContentList, "publishing", "publishing.pages.read.own", { items: [] }),
    route("publishing-content-create", "publishing/content/new", ContentEditor, "publishing", "publishing.pages.write.own", { mode: "create" }),
    route("publishing-review", "publishing/review", ReviewQueue, "publishing", "publishing.pages.review.any", { items: [], transition: unavailable }),
    route("publishing-revisions", "publishing/content/:contentID/revisions", RevisionHistory, "publishing", "publishing.revisions.read.own", { contentID: "", rollback: unavailable }),
    route("publishing-schedules", "publishing/schedules", ScheduleView, "publishing", "publishing.pages.publish.any", { schedules: [], createSchedule: unavailable, cancelSchedule: unavailable }),
    route("media-library", "media", MediaLibraryView, "media", "media.assets.read.own", { assets: [], upload: unavailable, remove: unavailable }),
    route("navigation-menus", "navigation/menus", MenuListView, "navigation", "navigation.menus.read.own", { menus: [] }),
    route("navigation-menu-editor", "navigation/menus/:menuID", MenuEditorView, "navigation", "navigation.menus.write.own", { menu: emptyMenu, save: unavailable }),
    route("discoverability-redirects", "discoverability/redirects", RedirectsView, "discoverability", "discoverability.redirects.read.own", { redirects: [], create: unavailable, update: unavailable, remove: unavailable }),
    route("discoverability-settings", "discoverability", DiscoverabilityView, "discoverability", "discoverability.seo.read.own", { audits: [], seo: emptySEO, runAudit: unavailable, saveSEO: unavailable }),
  ];
}

function route(
  name: string,
  path: string,
  component: NonNullable<RouteRecordRaw["component"]>,
  requiredModule: string,
  requiredPermission: string,
  props: Record<string, unknown>,
): RouteRecordRaw {
  return {
    path,
    name,
    component,
    props,
    meta: { requiresAuthentication: true, requiredModule, requiredPermission },
  };
}
