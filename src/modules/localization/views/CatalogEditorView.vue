<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import CatalogEntryEditor from "@/modules/localization/components/CatalogEntryEditor.vue";
import { getCatalog, updateCatalog } from "@/modules/localization/api/catalog.client";
import { listLocales, type Locale } from "@/modules/localization/api/locales.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

const props = defineProps<{ client: APIClient }>();
const locales = ref<Locale[]>([]);
const locale = ref("");
const category = ref("common");
const keyFilter = ref("");
const entries = ref<Record<string, string>>({});
const savedEntries = ref<Record<string, string>>({});
const version = ref(0);
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const notice = ref("");
const enabledLocales = computed(() => locales.value.filter((item) => item.enabled));
const dirty = computed(() => JSON.stringify(entries.value) !== JSON.stringify(savedEntries.value));

type UnloadEvent = { preventDefault: () => void };

function beforeUnload(event: UnloadEvent): void {
  if (!dirty.value) return;
  event.preventDefault();
}

onMounted(() => {
  globalThis.addEventListener("beforeunload", beforeUnload);
  void initialize();
});
onBeforeUnmount(() => globalThis.removeEventListener("beforeunload", beforeUnload));
onBeforeRouteLeave(() => {
  if (dirty.value && !saving.value && !globalThis.confirm("Discard unsaved translation changes?")) return false;
  return true;
});

async function initialize(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";
  try {
    locales.value = (await listLocales(props.client)).items;
    locale.value = enabledLocales.value[0]?.code ?? "";
    if (locale.value) await loadCatalog();
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    loading.value = false;
  }
}

async function loadCatalog(): Promise<void> {
  if (!locale.value || !category.value.trim()) return;
  loading.value = true;
  errorMessage.value = "";
  notice.value = "";
  try {
    const result = await getCatalog(props.client, locale.value, category.value.trim());
    entries.value = { ...result.entries };
    savedEntries.value = { ...result.entries };
    version.value = result.version;
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    loading.value = false;
  }
}

async function requestLoad(): Promise<void> {
  if (dirty.value && !globalThis.confirm("Discard unsaved translation changes?")) return;
  await loadCatalog();
}

async function saveCatalog(): Promise<void> {
  if (!locale.value || !category.value.trim()) return;
  saving.value = true;
  errorMessage.value = "";
  notice.value = "";
  try {
    const result = await updateCatalog(props.client, {
      locale: locale.value,
      category: category.value.trim(),
      entries: entries.value,
      expected_version: version.value,
    });
    version.value = result.version;
    savedEntries.value = { ...entries.value };
    notice.value = "Catalog saved.";
  } catch (error) {
    errorMessage.value = safeError(error).message;
    await loadCatalog();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="catalog-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        LOCALIZATION · CATALOG EDITOR
      </p>
      <h1 id="catalog-title">
        Catalog editor
      </h1>
      <p class="intro">
        Edit translations by locale and category. The server records version provenance and rejects stale writes.
      </p>
    </header>
    <p
      v-if="notice"
      class="notice"
      role="status"
    >
      {{ notice }}
    </p>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <form
      class="filters"
      @submit.prevent="requestLoad"
    >
      <label>Locale<select v-model="locale"><option
        v-for="item in enabledLocales"
        :key="item.id"
        :value="item.code"
      >{{ item.code }} · {{ item.name }}</option></select></label>
      <label>Category<input
        v-model="category"
        required
        placeholder="common"
      ></label>
      <label>Key filter<input
        v-model="keyFilter"
        placeholder="navigation"
      ></label>
      <button
        type="submit"
        :disabled="loading"
      >
        Load
      </button>
    </form>
    <p
      v-if="dirty"
      class="dirty"
      role="status"
    >
      Unsaved changes
    </p>
    <div
      v-if="loading"
      class="panel state"
      role="status"
    >
      Loading catalog…
    </div>
    <div
      v-else
      class="panel editor"
    >
      <CatalogEntryEditor
        v-model="entries"
        :filter="keyFilter"
        :disabled="saving"
      />
      <p class="version">
        Version {{ version }}
      </p>
      <button
        type="button"
        :disabled="saving || !locale || !dirty"
        @click="saveCatalog"
      >
        {{ saving ? "Saving…" : "Save catalog" }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(70rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin-bottom: .5rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, button { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.editor { display: grid; gap: .7rem; }
.version { color: #667085; font-size: .84rem; }
.dirty { color: #92400e; font-size: .84rem; font-weight: 700; }
.notice, .error-message { margin-bottom: 1rem; padding: .7rem .85rem; border: 1px solid #b8d9c1; border-radius: .55rem; color: #14532d; background: #f0fdf4; }
.error-message { border-color: #f0b5bd; color: #881337; background: #fff1f2; }
</style>
