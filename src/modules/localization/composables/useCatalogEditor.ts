import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import {
  exportCatalog, getCatalog, importCatalog, updateCatalog, type CatalogExport,
} from "@/modules/localization/api/catalog.client";
import { listLocales, type Locale } from "@/modules/localization/api/locales.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

export function useCatalogEditor(client: APIClient) {
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
  const enabledLocales = computed(() => locales.value.filter((item) => item.enabled));
  const dirty = computed(() => JSON.stringify(entries.value) !== JSON.stringify(savedEntries.value));

  function beforeUnload(event: Event): void {
    if (!dirty.value) return;
    event.preventDefault();
  }
  function canDiscard(): boolean {
    return !dirty.value || saving.value || globalThis.confirm("Discard unsaved translation changes?");
  }

  async function initialize(): Promise<void> {
    loading.value = true;
    errorMessage.value = "";
    try {
      locales.value = (await listLocales(client)).items;
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
    clearFeedback();
    try {
      const result = await getCatalog(client, locale.value, category.value.trim());
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
    if (canDiscard()) await loadCatalog();
  }

  async function saveCatalog(): Promise<void> {
    if (!locale.value || !category.value.trim()) return;
    saving.value = true;
    clearFeedback();
    try {
      const result = await updateCatalog(client, {
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
    clearFeedback();
    try {
      const exported = await exportCatalog(client, locale.value, category.value.trim());
      downloadExport(exported);
      notice.value = "Catalog exported.";
    } catch (error) {
      errorMessage.value = safeError(error).message;
    } finally {
      transferring.value = "";
    }
  }

  async function importFromFile(file: File): Promise<void> {
    if (transferring.value) return;
    transferring.value = "import";
    clearFeedback();
    try {
      const payload = JSON.parse(await file.text()) as Partial<CatalogExport>;
      if (!isMatchingExport(payload, locale.value, category.value.trim())) {
        throw new Error("The import file must match the selected locale and category.");
      }
      const result = await importCatalog(client, {
        locale: locale.value,
        category: category.value.trim(),
        expected_version: version.value,
        entries: payload.entries,
      });
      version.value = result.version;
      entries.value = { ...payload.entries };
      savedEntries.value = { ...entries.value };
      notice.value = "Catalog imported.";
    } catch (error) {
      errorMessage.value = safeError(error).message;
    } finally {
      transferring.value = "";
    }
  }

  function clearFeedback(): void { errorMessage.value = ""; notice.value = ""; }
  onMounted(() => {
    globalThis.addEventListener("beforeunload", beforeUnload);
    void initialize();
  });
  onBeforeUnmount(() => globalThis.removeEventListener("beforeunload", beforeUnload));
  onBeforeRouteLeave(() => canDiscard());

  return {
    locales, locale, category, keyFilter, entries, version, loading, saving, errorMessage,
    notice, transferring, enabledLocales, dirty, initialize, requestLoad, saveCatalog,
    downloadCatalog, importFromFile,
  };
}

function isMatchingExport(
  payload: Partial<CatalogExport>, locale: string, category: string,
): payload is CatalogExport {
  return payload.locale === locale && payload.category === category &&
    typeof payload.entries === "object" && payload.entries !== null && !Array.isArray(payload.entries) &&
    Object.values(payload.entries).every((entry) => typeof entry === "string");
}

function downloadExport(exported: CatalogExport): void {
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `localization-${exported.locale}-${exported.category}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
