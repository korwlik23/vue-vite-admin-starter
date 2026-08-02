<script setup lang="ts">
import type { PublishingRevision } from "@/modules/publishing/api/revisions.client";

defineProps<{
  revision: PublishingRevision;
  currentVersion?: number | undefined;
}>();
</script>

<template>
  <section
    class="revision-diff"
    aria-labelledby="revision-detail-title"
  >
    <h2 id="revision-detail-title">
      Revision details
    </h2>
    <dl>
      <div><dt>Summary</dt><dd>{{ revision.change_summary || "No summary" }}</dd></div>
      <div><dt>Source version</dt><dd>{{ revision.source_version }}</dd></div>
      <div><dt>Created</dt><dd><time :datetime="revision.created_at">{{ revision.created_at }}</time></dd></div>
      <div><dt>Snapshot hash</dt><dd><code>{{ revision.snapshot_hash }}</code></dd></div>
      <div v-if="currentVersion !== undefined">
        <dt>Current version</dt><dd>{{ currentVersion }}</dd>
      </div>
    </dl>
    <p class="diff-note">
      Revision snapshots are immutable. Rollback creates a new revision instead of rewriting this history.
    </p>
  </section>
</template>

<style scoped>
.revision-diff { display: grid; gap: .75rem; padding: 1rem; border: 1px solid #d5dbe5; border-radius: .8rem; background: rgb(248 250 252 / 75%); }
h2 { margin: 0; font-size: 1.1rem; }
dl { display: grid; gap: .6rem; margin: 0; }
dl div { display: grid; gap: .2rem; }
dt { color: #667085; font-size: .76rem; font-weight: 750; }
dd { margin: 0; overflow-wrap: anywhere; }
code { color: #344054; font-size: .78rem; }
.diff-note { margin: 0; color: #526078; font-size: .84rem; line-height: 1.5; }
</style>
