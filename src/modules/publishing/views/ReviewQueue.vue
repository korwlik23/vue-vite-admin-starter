<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { ref } from "vue";

import type { PublishingContent } from "@/modules/publishing/api/content.client";
import type { WorkflowRequest } from "@/modules/publishing/api/workflow.client";
import WorkflowActions from "@/modules/publishing/components/WorkflowActions.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import { safeError } from "@/shared/api/errors";

const props = withDefaults(defineProps<{
  items?: readonly PublishingContent[];
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
  busyContentID?: string;
  transition: (input: { contentID: string; input: WorkflowRequest }) => Promise<unknown>;
}>(), { items: () => [], loading: false, forbidden: false });

const busyID = ref("");
const localError = ref("");
const notice = ref("");

async function runTransition(item: PublishingContent, action: WorkflowRequest["action"]): Promise<void> {
  if (busyID.value) return;
  busyID.value = item.content_id;
  localError.value = "";
  notice.value = "";
  try {
    await props.transition({
      contentID: item.content_id,
      input: {
        action,
        translation_id: item.translation_id,
        locale_id: item.locale_id,
        expected_version: item.content_version,
      },
    });
    notice.value = `${item.title} updated.`;
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busyID.value = "";
  }
}
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="review-queue-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        PUBLISHING · REVIEW
      </p>
      <h1 id="review-queue-title">
        Review queue
      </h1>
      <p class="intro">
        Reviewers move content through explicit workflow transitions. Server permissions remain authoritative.
      </p>
    </header>
    <ForbiddenState v-if="forbidden" />
    <div
      v-else-if="loading"
      class="panel state"
      role="status"
    >
      Loading review queue…
    </div>
    <section
      v-else-if="error || localError"
      class="panel error-panel"
      role="alert"
    >
      <h2>Review queue unavailable</h2>
      <p>{{ error || localError }}</p>
      <button
        v-if="retry"
        type="button"
        @click="retry()"
      >
        Try again
      </button>
    </section>
    <p
      v-if="notice"
      class="notice"
      role="status"
    >
      {{ notice }}
    </p>
    <section
      v-if="!loading && !forbidden && !error && !localError && props.items.length === 0"
      class="panel state"
    >
      <h2>No items awaiting review</h2>
      <p>New drafts will appear here after authors submit them for review.</p>
    </section>
    <div
      v-else-if="!loading && !forbidden && !error && !localError"
      class="queue"
    >
      <article
        v-for="item in props.items"
        :key="item.content_id"
        class="panel queue-card"
      >
        <div>
          <p class="item-kind">
            {{ item.kind }} · {{ item.content_status }}
          </p>
          <h2>{{ item.title }}</h2>
          <p class="path">
            {{ item.path }} · v{{ item.content_version }}
          </p>
          <p class="excerpt">
            {{ item.excerpt || "No excerpt" }}
          </p>
        </div>
        <WorkflowActions
          :actions="['approve', 'publish', 'schedule', 'archive']"
          :disabled="busyID === item.content_id || busyContentID === item.content_id"
          :label-prefix="item.title"
          @action="runTransition(item, $event)"
        />
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(76rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { margin-bottom: .4rem; color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro, .excerpt { color: #526078; line-height: 1.6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.error-panel { border-color: #f0b5bd; color: #881337; background: #fff1f2; }
.error-panel button { min-height: 2.75rem; padding: .5rem .8rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; cursor: pointer; font: inherit; font-weight: 750; }
.notice { padding: .7rem .85rem; border: 1px solid #b8d9c1; border-radius: .55rem; color: #14532d; background: #f0fdf4; font-weight: 650; }
.queue { display: grid; gap: .8rem; }
.queue-card { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr) auto; }
.item-kind, .path { margin-bottom: .35rem; color: #667085; font-size: .78rem; font-weight: 750; text-transform: uppercase; letter-spacing: .06em; }
.path { font-weight: 500; text-transform: none; letter-spacing: normal; overflow-wrap: anywhere; }
@media (max-width: 42rem) { .queue-card { grid-template-columns: 1fr; } }
</style>
