<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { reactive, ref, watch } from "vue";

import type {
  Redirect,
  RedirectMutationRequest,
  RedirectUpdateRequest,
} from "@/modules/discoverability/api/redirects.client";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import { safeError } from "@/shared/api/errors";

interface RedirectDraft {
  source_path: string;
  destination_path: string;
  locale_id: string;
  status_code: RedirectMutationRequest["status_code"];
  enabled: boolean;
}

const props = withDefaults(defineProps<{
  redirects?: readonly Redirect[];
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
  create: (input: RedirectMutationRequest) => Promise<Redirect>;
  update: (input: RedirectUpdateRequest & { id: string }) => Promise<Redirect>;
  remove: (input: { id: string; expected_version: number }) => Promise<void>;
}>(), { redirects: () => [], loading: false, forbidden: false });

const drafts = reactive<Record<string, RedirectDraft>>({});
const busyID = ref("");
const localError = ref("");
const notice = ref("");
const newRedirect = reactive<RedirectMutationRequest>({
  source_path: "",
  destination_path: "",
  status_code: 301,
  enabled: true,
  locale_id: "",
});

function syncDrafts(redirects: readonly Redirect[]): void {
  for (const redirect of redirects) {
    drafts[redirect.id] ??= {
      source_path: redirect.source_path,
      destination_path: redirect.destination_path,
      locale_id: redirect.locale_id,
      status_code: redirect.status_code,
      enabled: redirect.enabled,
    };
  }
}

watch(() => props.redirects, syncDrafts, { immediate: true, deep: true });

function draftFor(redirect: Redirect): RedirectDraft {
  return drafts[redirect.id] ?? (drafts[redirect.id] = {
    source_path: redirect.source_path,
    destination_path: redirect.destination_path,
    locale_id: redirect.locale_id,
    status_code: redirect.status_code,
    enabled: redirect.enabled,
  });
}

async function saveRedirect(redirect: Redirect): Promise<void> {
  if (busyID.value) return;
  busyID.value = redirect.id;
  localError.value = "";
  notice.value = "";
  try {
    await props.update({ id: redirect.id, ...draftFor(redirect), expected_version: redirect.version });
    notice.value = `Redirect ${redirect.source_path} saved.`;
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busyID.value = "";
  }
}

async function deleteRedirect(redirect: Redirect): Promise<void> {
  if (busyID.value || !globalThis.confirm(`Delete redirect ${redirect.source_path}?`)) return;
  busyID.value = redirect.id;
  localError.value = "";
  try {
    await props.remove({ id: redirect.id, expected_version: redirect.version });
    notice.value = `Redirect ${redirect.source_path} deleted.`;
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busyID.value = "";
  }
}

async function createRedirect(): Promise<void> {
  if (busyID.value) return;
  busyID.value = "new";
  localError.value = "";
  notice.value = "";
  try {
    await props.create({ ...newRedirect });
    notice.value = "Redirect created.";
    newRedirect.source_path = "";
    newRedirect.destination_path = "";
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
    aria-labelledby="redirects-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        DISCOVERABILITY · REDIRECTS
      </p>
      <h1 id="redirects-title">
        Redirect rules
      </h1>
      <p class="intro">
        Keep URL changes explicit, versioned, and reversible. Server permissions and collision checks remain authoritative.
      </p>
    </header>
    <ForbiddenState v-if="props.forbidden" />
    <div
      v-else-if="props.loading"
      class="panel state"
      role="status"
    >
      Loading redirects…
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
        class="panel create-form"
        @submit.prevent="createRedirect"
      >
        <h2>Add redirect</h2>
        <div class="fields">
          <label>Source path<input
            v-model.trim="newRedirect.source_path"
            required
            placeholder="/old-path"
          ></label>
          <label>Destination path<input
            v-model.trim="newRedirect.destination_path"
            required
            placeholder="/new-path"
          ></label>
          <label>Locale ID<input
            v-model.trim="newRedirect.locale_id"
            required
          ></label>
          <label>Status<select v-model="newRedirect.status_code"><option :value="301">301</option><option :value="302">302</option><option :value="307">307</option><option :value="308">308</option></select></label>
        </div>
        <label class="enabled"><input
          v-model="newRedirect.enabled"
          type="checkbox"
        >Enabled</label>
        <button
          type="submit"
          :disabled="busyID !== ''"
        >
          Create redirect
        </button>
      </form>
      <section
        v-if="props.redirects.length === 0"
        class="panel state"
      >
        <h2>No redirects</h2><p>Add a rule when a public path changes.</p>
      </section>
      <div
        v-else
        class="redirect-list"
      >
        <article
          v-for="redirect in props.redirects"
          :key="redirect.id"
          class="panel redirect-card"
        >
          <div class="fields">
            <label>Source path<input v-model.trim="draftFor(redirect).source_path"></label>
            <label>Destination path<input v-model.trim="draftFor(redirect).destination_path"></label>
            <label>Locale ID<input v-model.trim="draftFor(redirect).locale_id"></label>
            <label>Status<select v-model="draftFor(redirect).status_code"><option :value="301">301</option><option :value="302">302</option><option :value="307">307</option><option :value="308">308</option></select></label>
            <label class="enabled"><input
              v-model="draftFor(redirect).enabled"
              type="checkbox"
            >Enabled</label>
          </div>
          <p class="helper">
            Version {{ redirect.version }} · {{ redirect.locale_id }}
          </p>
          <footer class="actions">
            <button
              type="button"
              :disabled="busyID !== ''"
              :aria-label="`Save redirect ${redirect.source_path}`"
              @click="saveRedirect(redirect)"
            >
              {{ busyID === redirect.id ? "Saving…" : "Save redirect" }}
            </button>
            <button
              type="button"
              class="danger"
              :disabled="busyID !== ''"
              :aria-label="`Delete redirect ${redirect.source_path}`"
              @click="deleteRedirect(redirect)"
            >
              Delete redirect
            </button>
          </footer>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped>
.admin-page { width: min(80rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { margin-bottom: .6rem; color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro, .helper { color: #526078; line-height: 1.5; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.create-form, .redirect-list { display: grid; gap: .8rem; }
.redirect-list { margin-top: .8rem; }
.fields { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); align-items: end; }
label { display: grid; gap: .3rem; color: #526078; font-size: .78rem; font-weight: 700; }
input, select { min-height: 2.6rem; padding: .45rem .6rem; border: 1px solid #aeb9c9; border-radius: .5rem; background: white; font: inherit; }
input[type="checkbox"] { min-height: 1.1rem; width: 1.1rem; }
.enabled { display: flex; min-height: 2.6rem; align-items: center; gap: .4rem; }
.helper { margin-bottom: 0; font-size: .84rem; }
.actions { display: flex; flex-wrap: wrap; gap: .55rem; }
button { min-height: 2.75rem; padding: .5rem .8rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: white; background: #155eef; cursor: pointer; font: inherit; font-weight: 750; }
button:disabled { cursor: wait; opacity: .65; }
button.danger { color: #9f1239; background: white; border-color: #f0b5bd; }
.error-panel, .notice { margin-block: 0 .8rem; padding: .7rem .85rem; border-radius: .55rem; }
.error-panel { border: 1px solid #f0b5bd; color: #881337; background: #fff1f2; }
.notice { border: 1px solid #b8d9c1; color: #14532d; background: #f0fdf4; font-weight: 650; }
</style>
