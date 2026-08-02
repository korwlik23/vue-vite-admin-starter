<script setup lang="ts">
import type { ContentAudit } from "@/modules/discoverability/api/audits.client";

defineOptions({ name: "ContentAuditPanel" });

defineProps<{ audit: ContentAudit }>();

function bounded(value: string): string {
  return value.length > 240 ? `${value.slice(0, 240)}…` : value;
}
</script>

<template>
  <article
    class="panel audit-card"
    :data-status="audit.status"
  >
    <header class="audit-header">
      <div>
        <p class="eyebrow">
          CONTENT AUDIT
        </p>
        <h2>{{ audit.content_id }} · {{ audit.locale_id }}</h2>
      </div>
      <span
        class="status"
        :data-status="audit.status"
      >{{ audit.status }}</span>
    </header>
    <p class="helper">
      Content v{{ audit.content_version }} · Translation v{{ audit.translation_version }}
    </p>
    <ul
      v-if="audit.checks.length > 0"
      class="checks"
    >
      <li
        v-for="check in audit.checks"
        :key="`${check.rule_key}-${check.message}`"
        :data-severity="check.severity"
      >
        <div class="check-title">
          <strong>{{ check.rule_key }}</strong><span>{{ check.severity }}</span>
        </div>
        <p>{{ bounded(check.message) }}</p>
        <small>Observed: {{ bounded(check.observed_value) }}</small>
      </li>
    </ul>
    <p
      v-else
      class="helper"
    >
      No rule findings.
    </p>
  </article>
</template>

<style scoped>
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.audit-card { display: grid; gap: .6rem; }
.audit-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
h2, p { margin-top: 0; }
h2 { margin-bottom: .2rem; color: #172033; font-size: 1.05rem; overflow-wrap: anywhere; }
.eyebrow { margin-bottom: .3rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.helper, small { color: #526078; line-height: 1.5; }
.status, .check-title span { display: inline-flex; align-items: center; border-radius: 999px; padding: .3rem .55rem; color: #14532d; background: #dcfce7; font-size: .72rem; font-weight: 750; text-transform: uppercase; }
.status[data-status="warning"], li[data-severity="warning"] .check-title span { color: #92400e; background: #fef3c7; }
.status[data-status="error"], li[data-severity="error"] .check-title span { color: #9f1239; background: #ffe4e6; }
.checks { display: grid; gap: .6rem; margin: .35rem 0 0; padding: 0; list-style: none; }
li { padding: .7rem; border: 1px solid #e2e8f0; border-radius: .65rem; background: #f8fafc; }
.check-title { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
li p { margin: .35rem 0 .15rem; color: #27364f; overflow-wrap: anywhere; }
small { display: block; overflow-wrap: anywhere; }
@media (max-width: 36rem) { .audit-header { flex-direction: column; } }
</style>
