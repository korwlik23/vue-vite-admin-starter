import type { RouteLocationNormalizedLoaded } from "vue-router";

import {
  createPublishingPage,
  createPublishingPost,
  getPublishingPage,
  getPublishingPost,
  listPublishingPages,
  listPublishingPosts,
  type PublishingContent,
  type PublishingContentListQuery,
} from "@/modules/publishing/api/content.client";
import {
  listPublishingRevisions,
  rollbackPublishingRevision,
  type PublishingRevision,
} from "@/modules/publishing/api/revisions.client";
import {
  cancelPublishingSchedule,
  createPublishingSchedule,
  listPublishingSchedules,
} from "@/modules/publishing/api/schedules.client";
import { transitionPublishingWorkflow } from "@/modules/publishing/api/workflow.client";
import type { ContentMutation } from "@/modules/publishing/schemas/content.schema";
import type { APIClient } from "@/shared/api/client";
import type { CMSRouteAdapter } from "@/app/router/cms/CMSRouteLoader.vue";

type CMSRoute = RouteLocationNormalizedLoaded;

function localeFromRoute(route: CMSRoute): string {
  const value = route.query.locale;
  return typeof value === "string" && value.trim() !== "" ? value : "en";
}

function contentQuery(route: CMSRoute): PublishingContentListQuery {
  return { locale: localeFromRoute(route), limit: 100 };
}

async function listAllContent(client: APIClient, route: CMSRoute) {
  const query = contentQuery(route);
  const [pages, posts] = await Promise.all([
    listPublishingPages(client, query),
    listPublishingPosts(client, query),
  ]);
  return [...pages.items, ...posts.items].sort((left, right) =>
    right.updated_at.localeCompare(left.updated_at),
  );
}

export function contentListAdapter(client: APIClient, route: CMSRoute): CMSRouteAdapter {
  return {
    initial: { items: [] },
    load: async () => ({ items: await listAllContent(client, route) }),
  };
}

export function contentEditorAdapter(client: APIClient): CMSRouteAdapter {
  return {
    initial: {
      mode: "create",
      submit: (input: ContentMutation): Promise<PublishingContent> =>
        input.kind === "post"
          ? createPublishingPost(client, input as Parameters<typeof createPublishingPost>[1])
          : createPublishingPage(client, input as Parameters<typeof createPublishingPage>[1]),
    },
  };
}

export function reviewQueueAdapter(client: APIClient, route: CMSRoute): CMSRouteAdapter {
  return {
    initial: {
      items: [],
      transition: ({ contentID, input }: { contentID: string; input: Parameters<typeof transitionPublishingWorkflow>[2] }) =>
        transitionPublishingWorkflow(client, contentID, input),
    },
    load: async () => ({ items: (await listAllContent(client, route)).filter((item) => item.content_status === "review") }),
  };
}

export function revisionHistoryAdapter(client: APIClient, route: CMSRoute): CMSRouteAdapter {
  const contentID = String(route.params.contentID ?? "");
  let current: PublishingContent | undefined;
  return {
    initial: {
      contentID,
      revisions: [],
      rollback: async (revision: PublishingRevision) => {
        if (!current) throw new Error("Content is not loaded.");
        return rollbackPublishingRevision(client, contentID, revision.id, {
          change_summary: `Rollback ${revision.change_summary || revision.id}`,
          expected_version: current.content_version,
          locale_id: current.locale_id,
          translation_id: current.translation_id,
        });
      },
    },
    load: async () => {
      try {
        current = await getPublishingPage(client, contentID, localeFromRoute(route));
      } catch {
        current = await getPublishingPost(client, contentID, localeFromRoute(route));
      }
      const result = await listPublishingRevisions(client, contentID, {
        translationId: current.translation_id,
        limit: 100,
      });
      return { revisions: result.items, contentVersion: current.content_version };
    },
  };
}

export function schedulesAdapter(client: APIClient): CMSRouteAdapter {
  return {
    initial: {
      schedules: [],
      createSchedule: (input: Parameters<typeof createPublishingSchedule>[1]) => createPublishingSchedule(client, input),
      cancelSchedule: (scheduleID: string) => cancelPublishingSchedule(client, scheduleID),
    },
    load: async () => ({ schedules: (await listPublishingSchedules(client, { limit: 100 })).items }),
  };
}
