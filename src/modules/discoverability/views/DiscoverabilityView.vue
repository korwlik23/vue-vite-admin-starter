<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { reactive, ref, watch } from "vue";

import type { ContentAudit, RunContentAuditRequest } from "@/modules/discoverability/api/audits.client";
import type { SEODefaults, SEOUpdateRequest } from "@/modules/discoverability/api/settings.client";
import ContentAuditPanel from "@/modules/discoverability/components/ContentAuditPanel.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import { safeError } from "@/shared/api/errors";

const props = withDefaults(defineProps<{
  audits?: readonly ContentAudit[];
  seo?: SEODefaults;
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
  runAudit: (input?: RunContentAuditRequest) => Promise<ContentAudit>;
  saveSEO: (input: SEOUpdateRequest) => Promise<SEODefaults>;
}>(), { audits: () => [], loading: false, forbidden: false });

const emit = defineEmits<{ auditCompleted: [value: ContentAudit]; seoSaved: [value: SEODefaults] }>();

const seoDraft = reactive<SEOUpdateRequest>({
  locale_id: props.seo?.locale_id ?? "",
  title: props.seo?.title ?? "",
  description: props.seo?.description ?? "",
  canonical_base: props.seo?.canonical_base ?? "",
  robots: props.seo?.robots ?? "index,follow",
  expected_version: props.seo?.version ?? 0,
});
const auditInput = reactive<RunContentAuditRequest>({
  content_id: props.audits[0]?.content_id ?? "",
  locale_id: props.audits[0]?.locale_id ?? props.seo?.locale_id ?? "",
});
const busy = ref("");
const localError = ref("");
const notice = ref("");

watch(() => props.seo, (seo) => {
  if (!seo) return;
  Object.assign(seoDraft, {
    locale_id: seo.locale_id,
    title: seo.title,
    description: seo.description,
    canonical_base: seo.canonical_base,
    robots: seo.robots,
    expected_version: seo.version,
  });
  if (!auditInput.locale_id) auditInput.locale_id = seo.locale_id;
}, { deep: true });

watch(() => props.audits, (audits) => {
  const first = audits[0];
  if (first) {
    auditInput.content_id = first.content_id;
    auditInput.locale_id = first.locale_id;
  }
}, { deep: true });

async function submitSEO(): Promise<void> {
  if (busy.value) return;
  busy.value = "seo";
  localError.value = "";
  notice.value = "";
  try {
    const saved = await props.saveSEO({ ...seoDraft, expected_version: props.seo?.version ?? seoDraft.expected_version });
    notice.value = "SEO defaults saved.";
    emit("seoSaved", saved);
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busy.value = "";
  }
}

async function submitAudit(): Promise<void> {
  if (busy.value) return;
  if (!auditInput.content_id || !auditInput.locale_id) {
    localError.value = "Content and locale are required to run an audit.";
    return;
  }
  busy.value = "audit";
  localError.value = "";
  notice.value = "";
  try {
    const audit = await props.runAudit({ ...auditInput });
    notice.value = "Content audit completed.";
    emit("auditCompleted", audit);
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busy.value = "";
  }
}
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="discoverability-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        DISCOVERABILITY · SEO
      </p>
      <h1 id="discoverability-title">
        Discoverability controls
      </h1>
      <p class="intro">
        Manage locale defaults and run bounded content audits without exposing internal storage or provider details.
      </p>
    </header>
    <ForbiddenState v-if="props.forbidden" />
    <div
      v-else-if="props.loading"
      class="panel state"
      role="status"
    >
      Loading discoverability settings…
    </div>
    <template v-else>
      <p
        v-if="props.error || localError"
        class="error-panel"
        role="alert"
      >
        {{ props.error || localError }}
      </p>
      <p
        v-if="notice"
        class="notice"
        role="status"
      >
        {{ notice }}
      </p>
      <form
        class="panel seo-form"
        @submit.prevent="submitSEO"
      >
        <div>
          <p class="eyebrow">
            SEO DEFAULTS
          </p><h2>Locale metadata</h2>
        </div>
        <div class="fields">
          <label>Locale ID<input
            v-model.trim="seoDraft.locale_id"
            required
          ></label>
          <label>Title<input
            v-model.trim="seoDraft.title"
            required
            maxlength="160"
          ></label>
          <label class="wide">Description<textarea
            v-model.trim="seoDraft.description"
            required
            maxlength="320"
          /></label>
          <label>Canonical base<input
            v-model.trim="seoDraft.canonical_base"
            required
            type="url"
          ></label>
          <label>Robots<select v-model="seoDraft.robots"><option value="index,follow">index,follow</option><option value="noindex,follow">noindex,follow</option><option value="index,nofollow">index,nofollow</option><option value="noindex,nofollow">noindex,nofollow</option></select></label>
        </div>
        <button
          type="submit"
          :disabled="busy !== ''"
        >
          {{ busy === "seo" ? "Saving…" : "Save SEO defaults" }}
        </button>
      </form>
      <section class="panel audit-runner">
        <div>
          <p class="eyebrow">
            CONTENT AUDIT
          </p><h2>Check a translation</h2><p class="helper">
            The audit response is rendered as bounded rule findings.
          </p>
        </div>
        <div class="fields">
          <label>Content ID<input
            v-model.trim="auditInput.content_id"
            required
          ></label>
          <label>Locale ID<input
            v-model.trim="auditInput.locale_id"
            required
          ></label>
        </div>
        <button
          type="button"
          :disabled="busy !== '' || !auditInput.content_id || !auditInput.locale_id"
          aria-label="Run content audit"
          @click="submitAudit"
        >
          {{ busy === "audit" ? "Running…" : "Run content audit" }}
        </button>
      </section>
      <section
        class="audit-list"
        aria-labelledby="audit-results-title"
      >
        <div class="section-heading">
          <h2 id="audit-results-title">
            Recent audits
          </h2><span>{{ props.audits.length }}</span>
        </div>
        <p
          v-if="props.audits.length === 0"
          class="panel state"
        >
          No content audits yet.
        </p>
        <ContentAuditPanel
          v-for="audit in props.audits"
          v-else
          :key="audit.id"
          :audit="audit"
        />
      </section>
    </template>
  </section>
</template>

<style scoped>
.admin-page { width: min(80rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { margin-bottom: .4rem; color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro, .helper { color: #526078; line-height: 1.5; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.seo-form, .audit-runner { display: grid; gap: .9rem; margin-bottom: .8rem; }
.fields { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); align-items: end; }
.wide { grid-column: span 2; }
label { display: grid; gap: .3rem; color: #526078; font-size: .78rem; font-weight: 700; }
input, textarea, select { min-height: 2.6rem; padding: .45rem .6rem; border: 1px solid #aeb9c9; border-radius: .5rem; background: white; font: inherit; }
textarea { min-height: 5.5rem; resize: vertical; }
button { min-height: 2.75rem; width: fit-content; padding: .5rem .8rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: white; background: #155eef; cursor: pointer; font: inherit; font-weight: 750; }
button:disabled { cursor: wait; opacity: .65; }
.audit-list { display: grid; gap: .8rem; margin-top: 1.5rem; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.section-heading span { min-width: 1.8rem; padding: .25rem .45rem; border-radius: 999px; color: #344054; background: #e2e8f0; text-align: center; font-size: .78rem; font-weight: 750; }
.state { padding-block: 2rem; text-align: center; }
.error-panel, .notice { margin-block: 0 .8rem; padding: .7rem .85rem; border-radius: .55rem; }
.error-panel { border: 1px solid #f0b5bd; color: #881337; background: #fff1f2; }
.notice { border: 1px solid #b8d9c1; color: #14532d; background: #f0fdf4; font-weight: 650; }
@media (max-width: 42rem) { .wide { grid-column: auto; } }
</style>
