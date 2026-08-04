<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import CatalogEntryEditor from "@/modules/localization/components/CatalogEntryEditor.vue";
import {
  exportCatalog,
  getCatalog,
  importCatalog,
  updateCatalog,
  type CatalogExport,
} from "@/modules/localization/api/catalog.client";
import {
  listLocales,
  type Locale,
} from "@/modules/localization/api/locales.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";
import UiButton from "@/shared/components/ui/UiButton.vue";
import UiFileInput from "@/shared/components/ui/UiFileInput.vue";
import UiInput from "@/shared/components/ui/UiInput.vue";
import UiSelect from "@/shared/components/ui/UiSelect.vue";

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
const transferring = ref<"export" | "import" | "">("");
const enabledLocales = computed(() =>
  locales.value.filter((item) => item.enabled),
);
const dirty = computed(
  () => JSON.stringify(entries.value) !== JSON.stringify(savedEntries.value),
);

type UnloadEvent = { preventDefault: () => void };

function beforeUnload(event: UnloadEvent): void {
  if (!dirty.value) return;
  event.preventDefault();
}

onMounted(() => {
  globalThis.addEventListener("beforeunload", beforeUnload);
  void initialize();
});
onBeforeUnmount(() =>
  globalThis.removeEventListener("beforeunload", beforeUnload),
);
onBeforeRouteLeave(() => {
  if (
    dirty.value &&
    !saving.value &&
    !globalThis.confirm("Discard unsaved translation changes?")
  )
    return false;
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
    const result = await getCatalog(
      props.client,
      locale.value,
      category.value.trim(),
    );
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
  if (
    dirty.value &&
    !globalThis.confirm("Discard unsaved translation changes?")
  )
    return;
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

async function downloadCatalog(): Promise<void> {
  if (!locale.value || !category.value.trim() || transferring.value) return;
  transferring.value = "export";
  errorMessage.value = "";
  notice.value = "";
  try {
    const exported = await exportCatalog(
      props.client,
      locale.value,
      category.value.trim(),
    );
    const blob = new globalThis.Blob([JSON.stringify(exported, null, 2)], {
      type: "application/json",
    });
    const url = globalThis.URL.createObjectURL(blob);
    const link = globalThis.document.createElement("a");
    link.href = url;
    link.download = `localization-${exported.locale}-${exported.category}.json`;
    link.click();
    globalThis.URL.revokeObjectURL(url);
    notice.value = "Catalog exported.";
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    transferring.value = "";
  }
}

async function importFromFile(event: globalThis.Event): Promise<void> {
  const input = event.target as unknown as { files: globalThis.FileList | null; value: string };
  const file = input.files?.[0];
  input.value = "";
  if (!file || transferring.value) return;
  transferring.value = "import";
  errorMessage.value = "";
  notice.value = "";
  try {
    const payload = JSON.parse(await file.text()) as Partial<CatalogExport>;
    if (
      payload.locale !== locale.value ||
      payload.category !== category.value.trim() ||
      payload.entries === undefined ||
      typeof payload.entries !== "object" ||
      payload.entries === null ||
      Array.isArray(payload.entries)
    ) {
      throw new Error(
        "The import file must match the selected locale and category.",
      );
    }
    const result = await importCatalog(props.client, {
      locale: locale.value,
      category: category.value.trim(),
      expected_version: version.value,
      entries: payload.entries,
    });
    version.value = result.version;
    entries.value = { ...(payload.entries as Record<string, string>) };
    savedEntries.value = { ...entries.value };
    notice.value = "Catalog imported.";
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    transferring.value = "";
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
        Edit translations by locale and category. The server records version
        provenance and rejects stale writes.
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
      <label>Locale<UiSelect v-model="locale"><option
        v-for="item in enabledLocales"
        :key="item.id"
        :value="item.code"
      >
        {{ item.code }} · {{ item.name }}
      </option></UiSelect></label>
      <label>Category<UiInput
        v-model="category"
        required
        placeholder="common"
      /></label>
      <label>Key filter<UiInput
        v-model="keyFilter"
        placeholder="navigation"
      /></label>
      <UiButton
        type="submit"
        :disabled="loading"
      >
        Load
      </UiButton>
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
      <UiButton
        type="button"
        :loading="saving"
        loading-label="Saving…"
        :disabled="saving || !locale || !dirty"
        @click="saveCatalog"
      >
        Save catalog
      </UiButton>
      <div class="transfer-actions">
        <UiButton
          type="button"
          variant="secondary"
          :loading="transferring === 'export'"
          loading-label="Exporting…"
          :disabled="Boolean(transferring) || !locale || !category.trim()"
          @click="downloadCatalog"
        >
          Export JSON
        </UiButton>
        <label class="file-button">
          <span>Import JSON</span>
          <UiFileInput
            accept="application/json,.json"
            :disabled="Boolean(transferring)"
            @change="importFromFile"
          />
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-page {
  width: min(70rem, 100%);
  margin-inline: auto;
}
.page-header {
  margin-bottom: 1.4rem;
}
h1,
p {
  margin-top: 0;
}
h1 {
  margin-bottom: 0.65rem;
  color: #101828;
  font-size: clamp(2rem, 4vw, 3.4rem);
  letter-spacing: -0.045em;
}
.eyebrow {
  margin-bottom: 0.35rem;
  color: #526078;
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.14em;
}
.intro {
  color: #526078;
  line-height: 1.6;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
label {
  display: grid;
  gap: 0.3rem;
  color: #526078;
  font-size: 0.8rem;
  font-weight: 700;
}
input,
select,
button {
  min-height: 2.65rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid #aeb9c9;
  border-radius: 0.55rem;
  background: white;
  font: inherit;
}
button {
  color: #172033;
  cursor: pointer;
  font-weight: 750;
}
button:disabled {
  cursor: wait;
  opacity: 0.6;
}
.panel {
  padding: 1rem;
  border: 1px solid #d5dbe5;
  border-radius: 1rem;
  background: rgb(255 255 255 / 86%);
}
.state {
  padding-block: 3rem;
  text-align: center;
}
.editor {
  display: grid;
  gap: 0.7rem;
}
.transfer-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.file-button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding-inline: 1rem;
  border: 1px solid #cfd6e2;
  border-radius: 0.75rem;
  color: #172033;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
}
.file-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.version {
  color: #667085;
  font-size: 0.84rem;
}
.dirty {
  color: #92400e;
  font-size: 0.84rem;
  font-weight: 700;
}
.notice,
.error-message {
  margin-bottom: 1rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #b8d9c1;
  border-radius: 0.55rem;
  color: #14532d;
  background: #f0fdf4;
}
.error-message {
  border-color: #f0b5bd;
  color: #881337;
  background: #fff1f2;
}
</style>
