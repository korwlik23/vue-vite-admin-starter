<script setup lang="ts">
import type { Role } from "@/modules/authorization/api/roles.client";
import { UiBadge, UiButton, UiCard, UiField, UiInput } from "@/shared/components/ui";

defineProps<{ role: Role; renameName: string; busy: boolean }>();
defineEmits<{ "update:renameName": [value: string]; rename: [] }>();

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
</script>

<template>
  <UiCard
    :title="role.name"
    description="Role identity and ownership"
  >
    <div class="summary-heading">
      <UiBadge variant="info">
        v{{ role.version }}
      </UiBadge>
      <span>Account: {{ role.account_id || "System" }}</span>
    </div>
    <form
      class="summary-form"
      aria-label="Rename role"
      @submit.prevent="$emit('rename')"
    >
      <UiField
        id="rename-role-name"
        label="Role name"
        required
      >
        <UiInput
          id="rename-role-name"
          :model-value="renameName"
          maxlength="128"
          required
          @update:model-value="$emit('update:renameName', $event)"
        />
      </UiField>
      <UiButton
        type="submit"
        :disabled="busy"
      >
        Save name
      </UiButton>
    </form>
    <p class="metadata">
      Updated {{ formatDate(role.updated_at) }}
    </p>
  </UiCard>
</template>

<style scoped>
.summary-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); color: var(--color-text-muted); }
.summary-form { display: grid; gap: var(--space-3); margin-block: var(--space-4); }
.metadata { margin: 0; color: var(--color-text-muted); font-size: var(--text-sm); }
</style>
