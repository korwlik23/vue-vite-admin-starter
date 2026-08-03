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
import CMSRouteLoader, { type CMSRouteAdapterFactory } from "@/app/router/cms/CMSRouteLoader.vue";
import {
  contentEditorAdapter,
  contentListAdapter,
  reviewQueueAdapter,
  revisionHistoryAdapter,
  schedulesAdapter,
} from "@/app/router/cms/adapters/publishing";
import { mediaLibraryAdapter } from "@/app/router/cms/adapters/media";
import { menuEditorAdapter, menuListAdapter } from "@/app/router/cms/adapters/navigation";
import { discoverabilityAdapter, redirectsAdapter } from "@/app/router/cms/adapters/discoverability";

export interface CMSRouteDependencies {
  client: APIClient;
}

export function createCMSRoutes(dependencies: CMSRouteDependencies): RouteRecordRaw[] {
  return [
    route("publishing-content", "publishing/content", ContentList, "publishing", "publishing.pages.read.own", contentListAdapter, dependencies),
    route("publishing-content-create", "publishing/content/new", ContentEditor, "publishing", "publishing.pages.write.own", (client) => contentEditorAdapter(client), dependencies),
    route("publishing-review", "publishing/review", ReviewQueue, "publishing", "publishing.pages.review.any", reviewQueueAdapter, dependencies),
    route("publishing-revisions", "publishing/content/:contentID/revisions", RevisionHistory, "publishing", "publishing.revisions.read.own", revisionHistoryAdapter, dependencies),
    route("publishing-schedules", "publishing/schedules", ScheduleView, "publishing", "publishing.pages.publish.any", (client) => schedulesAdapter(client), dependencies),
    route("media-library", "media", MediaLibraryView, "media", "media.assets.read.own", (client) => mediaLibraryAdapter(client), dependencies),
    route("navigation-menus", "navigation/menus", MenuListView, "navigation", "navigation.menus.read.own", menuListAdapter, dependencies),
    route("navigation-menu-editor", "navigation/menus/:menuID", MenuEditorView, "navigation", "navigation.menus.write.own", menuEditorAdapter, dependencies),
    route("discoverability-redirects", "discoverability/redirects", RedirectsView, "discoverability", "discoverability.redirects.read.own", (client) => redirectsAdapter(client), dependencies),
    route("discoverability-settings", "discoverability", DiscoverabilityView, "discoverability", "discoverability.seo.read.own", discoverabilityAdapter, dependencies),
  ];
}

function route(
  name: string,
  path: string,
  component: NonNullable<RouteRecordRaw["component"]>,
  requiredModule: string,
  requiredPermission: string,
  factory: CMSRouteAdapterFactory,
  dependencies: CMSRouteDependencies,
): RouteRecordRaw {
  return {
    path,
    name,
    component: CMSRouteLoader,
    props: { view: component, client: dependencies.client, factory },
    meta: { requiresAuthentication: true, requiredModule, requiredPermission },
  };
}
