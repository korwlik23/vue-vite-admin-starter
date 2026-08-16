<script setup lang="ts">
import CatalogEntryEditor from "@/modules/localization/components/CatalogEntryEditor.vue";
import CatalogTransferActions from "@/modules/localization/components/CatalogTransferActions.vue";
import { useCatalogEditor } from "@/modules/localization/composables/useCatalogEditor";
import type { APIClient } from "@/shared/api/client";
import LoadingState from "@/shared/components/feedback/LoadingState.vue";
import {
  UiAlert, UiBadge, UiButton, UiCard, UiField, UiInput, UiPage, UiPageHeader,
  UiSelect, UiToolbar,
} from "@/shared/components/ui";

const props = defineProps<{ client: APIClient }>();
const state = useCatalogEditor(props.client);
</script>

<template>
  <UiPage aria-labelledby="catalog-title">
    <UiPageHeader
      title="Catalog editor"
      description="Edit translations by locale and category with version-aware writes."
    >
      <template #actions>
        <UiBadge :variant="state.dirty.value ? 'warning' : 'success'">
          {{ state.dirty.value ? "Unsaved changes" : `Version ${state.version.value}` }}
        </UiBadge>
      </template>
    </UiPageHeader>

    <UiAlert
      v-if="state.notice.value"
      variant="success"
    >
      {{ state.notice.value }}
    </UiAlert>
    <UiAlert
      v-if="state.errorMessage.value"
      variant="danger"
    >
      {{ state.errorMessage.value }}
    </UiAlert>

    <form
      aria-label="Catalog filters"
      @submit.prevent="state.requestLoad"
    >
      <UiToolbar aria-label="Catalog filters">
        <UiField
          id="catalog-locale"
          label="Locale"
        >
          <UiSelect
            id="catalog-locale"
            v-model="state.locale.value"
          >
            <option
              v-for="item in state.enabledLocales.value"
              :key="item.id"
              :value="item.code"
            >
              {{ item.code }} · {{ item.name }}
            </option>
          </UiSelect>
        </UiField>
        <UiField
          id="catalog-category"
          label="Category"
          required
        >
          <UiInput
            id="catalog-category"
            v-model="state.category.value"
            required
            placeholder="common"
          />
        </UiField>
        <UiField
          id="catalog-filter"
          label="Key filter"
        >
          <UiInput
            id="catalog-filter"
            v-model="state.keyFilter.value"
            placeholder="navigation"
          />
        </UiField>
        <UiButton
          type="submit"
          :disabled="state.loading.value"
        >
          Load
        </UiButton>
      </UiToolbar>
    </form>

    <LoadingState
      v-if="state.loading.value"
      label="Loading catalog"
    />
    <UiCard
      v-else
      title="Translation entries"
      :description="`Version ${state.version.value}`"
    >
      <div class="editor-stack">
        <CatalogEntryEditor
          v-model="state.entries.value"
          :filter="state.keyFilter.value"
          :disabled="state.saving.value"
        />
        <div class="editor-actions">
          <UiButton
            type="button"
            :loading="state.saving.value"
            loading-label="Saving…"
            :disabled="state.saving.value || !state.locale.value || !state.dirty.value"
            @click="state.saveCatalog"
          >
            Save catalog
          </UiButton>
          <CatalogTransferActions
            :transferring="state.transferring.value"
            :disabled="!state.locale.value || !state.category.value.trim()"
            @export="state.downloadCatalog"
            @import="state.importFromFile"
          />
        </div>
      </div>
    </UiCard>
  </UiPage>
</template>

<style scoped>
.editor-stack { display: grid; gap: var(--space-4); }
.editor-actions { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; }
</style>
