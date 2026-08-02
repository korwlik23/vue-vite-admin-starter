<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { ref } from "vue";

import type { PublishingRevision } from "@/modules/publishing/api/revisions.client";
import RevisionDiff from "@/modules/publishing/components/RevisionDiff.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import { safeError } from "@/shared/api/errors";

const props = withDefaults(defineProps<{
  contentID: string;
  contentVersion?: number;
  revisions?: readonly PublishingRevision[];
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
  busyRevisionID?: string;
  rollback: (revision: PublishingRevision) => Promise<unknown>;
}>(), { revisions: () => [], loading: false, forbidden: false });

const selected = ref<PublishingRevision>();
const busyID = ref("");
const localError = ref("");
const notice = ref("");

function select(revision: PublishingRevision): void {
  selected.value = revision;
  localError.value = "";
}

async function runRollback(revision: PublishingRevision): Promise<void> {
  if (busyID.value) return;
  if (typeof globalThis.confirm === "function" && !globalThis.confirm(`Rollback ${revision.change_summary || "this revision"}?`)) return;
  busyID.value = revision.id;
  localError.value = "";
  notice.value = "";
  try {
    await props.rollback(revision);
    notice.value = "Rollback requested. A new revision will represent the restored state.";
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
    aria-labelledby="revision-history-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        PUBLISHING · HISTORY
      </p>
      <h1 id="revision-history-title">
        Revision history
      </h1>
      <p class="intro">
        Inspect immutable author snapshots and roll back with optimistic version checks.
      </p>
    </header>
    <ForbiddenState v-if="forbidden" />
    <div
      v-else-if="loading"
      class="panel state"
      role="status"
    >
      Loading revisions…
    </div>
    <section
      v-else-if="error || localError"
      class="panel error-panel"
      role="alert"
    >
      <h2>Revision history unavailable</h2>
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
      v-if="!loading && !forbidden && !error && !localError && props.revisions.length === 0"
      class="panel state"
    >
      <h2>No revisions</h2>
      <p>Saved content revisions will appear here.</p>
    </section>
    <div
      v-else-if="!loading && !forbidden && !error && !localError"
      class="history-layout"
    >
      <div class="panel table-wrap">
        <table>
          <caption class="sr-only">
            Immutable content revisions
          </caption>
          <thead>
            <tr>
              <th scope="col">
                Created
              </th><th scope="col">
                Summary
              </th><th scope="col">
                Version
              </th><th scope="col">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="revision in props.revisions"
              :key="revision.id"
            >
              <td><time :datetime="revision.created_at">{{ revision.created_at }}</time></td>
              <th scope="row">
                {{ revision.change_summary || "No summary" }}
              </th>
              <td>{{ revision.source_version }}</td>
              <td class="actions">
                <button
                  type="button"
                  @click="select(revision)"
                >
                  Inspect
                </button>
                <button
                  type="button"
                  :aria-label="`Rollback revision ${revision.change_summary || revision.id}`"
                  :disabled="busyID === revision.id || busyRevisionID === revision.id"
                  @click="runRollback(revision)"
                >
                  {{ busyID === revision.id ? "Rolling back…" : "Rollback" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <RevisionDiff
        v-if="selected"
        :revision="selected"
        :current-version="contentVersion"
      />
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(92rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.error-panel { border-color: #f0b5bd; color: #881337; background: #fff1f2; }
.notice { padding: .7rem .85rem; border: 1px solid #b8d9c1; border-radius: .55rem; color: #14532d; background: #f0fdf4; font-weight: 650; }
.error-panel button, button { min-height: 2.75rem; padding: .5rem .75rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: #172033; background: white; cursor: pointer; font: inherit; font-weight: 750; }
button:disabled { cursor: wait; opacity: .55; }
.history-layout { display: grid; gap: .8rem; grid-template-columns: minmax(0, 1.4fr) minmax(16rem, .6fr); align-items: start; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 42rem; border-collapse: collapse; }
th, td { padding: .7rem .55rem; border-bottom: 1px solid #e5e9f0; text-align: left; vertical-align: top; }
th { color: #526078; font-size: .76rem; }
.actions { display: flex; flex-wrap: wrap; gap: .35rem; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 56rem) { .history-layout { grid-template-columns: 1fr; } }
</style>
