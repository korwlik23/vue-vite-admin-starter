<script setup lang="ts">
import { ref } from "vue";

import LoadingState from "@/shared/components/feedback/LoadingState.vue";
import {
  UiBadge, UiButton, UiCard, UiCheckbox, UiEmptyState, UiField, UiInput,
  UiPage, UiPageHeader, UiRadio, UiSelect, UiTextarea,
} from "@/shared/components/ui";

const title = ref("Example page title");
const locale = ref("en");
const body = ref("Reusable primitives keep labels, focus states and validation consistent.");
const enabled = ref(true);
const density = ref("comfortable");
</script>

<template>
  <UiPage aria-labelledby="ui-components-title">
    <UiPageHeader
      title="UI Components"
      description="Reusable Admin primitives and their supported states."
    />
    <section
      class="showcase-grid"
      aria-label="UI component examples"
    >
      <UiCard
        title="Buttons"
        description="Actions share variants, sizes and loading behavior."
      >
        <div class="example-row">
          <UiButton>Primary</UiButton>
          <UiButton variant="secondary">
            Secondary
          </UiButton>
          <UiButton
            variant="ghost"
            size="sm"
          >
            Ghost
          </UiButton>
          <UiButton
            variant="danger"
            size="sm"
          >
            Danger
          </UiButton>
          <UiButton
            loading
            loading-label="Saving"
          >
            Loading
          </UiButton>
        </div>
      </UiCard>

      <UiCard
        title="Status"
        description="Badges communicate state without relying on color alone."
      >
        <div class="example-row">
          <UiBadge>Draft</UiBadge>
          <UiBadge variant="info">
            Review
          </UiBadge>
          <UiBadge variant="success">
            Published
          </UiBadge>
          <UiBadge variant="warning">
            Scheduled
          </UiBadge>
          <UiBadge variant="danger">
            Failed
          </UiBadge>
        </div>
      </UiCard>

      <UiCard
        title="Selection controls"
        description="Native keyboard and form semantics are preserved."
      >
        <div class="selection-stack">
          <UiCheckbox v-model="enabled">
            Enable public preview
          </UiCheckbox>
          <div class="example-row">
            <UiRadio
              v-model="density"
              value="comfortable"
              name="density"
            >
              Comfortable
            </UiRadio>
            <UiRadio
              v-model="density"
              value="compact"
              name="density"
            >
              Compact
            </UiRadio>
          </div>
        </div>
      </UiCard>

      <UiCard
        title="Form controls"
        description="Labels and error text remain associated with controls."
      >
        <div class="form-grid">
          <UiField
            id="showcase-title"
            label="Title"
            required
            hint="Shown in the content header."
          >
            <UiInput
              id="showcase-title"
              v-model="title"
              required
            />
          </UiField>
          <UiField
            id="showcase-locale"
            label="Locale"
          >
            <UiSelect
              id="showcase-locale"
              v-model="locale"
            >
              <option value="en">
                English
              </option>
              <option value="th">
                ไทย
              </option>
            </UiSelect>
          </UiField>
          <UiField
            id="showcase-body"
            label="Body"
            error="Example validation message."
          >
            <UiTextarea
              id="showcase-body"
              v-model="body"
              invalid
              aria-describedby="showcase-body-error"
            />
          </UiField>
        </div>
      </UiCard>

      <UiCard title="Loading state">
        <LoadingState label="Loading component preview" />
      </UiCard>
      <UiCard title="Empty state">
        <UiEmptyState
          title="No records yet"
          description="Create a record to see it appear in this collection."
        >
          <template #action>
            <UiButton size="sm">
              Create record
            </UiButton>
          </template>
        </UiEmptyState>
      </UiCard>
    </section>
  </UiPage>
</template>

<style scoped>
.showcase-grid { display: grid; gap: var(--space-4); grid-template-columns: repeat(2, minmax(0, 1fr)); }
.showcase-grid > :nth-child(3) { grid-column: 1 / -1; }
.example-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); }
.selection-stack { display: grid; gap: var(--space-3); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
.form-grid > :last-child { grid-column: 1 / -1; }
@media (max-width: 48rem) {
  .showcase-grid, .form-grid { grid-template-columns: minmax(0, 1fr); }
  .showcase-grid > :nth-child(3), .form-grid > :last-child { grid-column: auto; }
}
</style>
