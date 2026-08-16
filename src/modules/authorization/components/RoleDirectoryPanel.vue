<script setup lang="ts">
import type { Role } from "@/modules/authorization/api/roles.client";
import {
  UiBadge, UiButton, UiCard, UiEmptyState, UiField, UiInput, UiTableFrame,
} from "@/shared/components/ui";

defineProps<{
  roles: readonly Role[];
  selectedRoleId: string;
  accountId: string;
  createName: string;
  busy: boolean;
}>();
defineEmits<{
  "update:accountId": [value: string];
  "update:createName": [value: string];
  select: [roleId: string];
  create: [];
}>();
</script>

<template>
  <UiCard
    title="Role directory"
    description="Create and select account-owned roles"
  >
    <form
      class="create-form"
      aria-label="Create role"
      @submit.prevent="$emit('create')"
    >
      <UiField
        id="account-id"
        label="Account ID"
        required
      >
        <UiInput
          id="account-id"
          :model-value="accountId"
          autocomplete="off"
          required
          placeholder="account-…"
          @update:model-value="$emit('update:accountId', $event)"
        />
      </UiField>
      <UiField
        id="role-name"
        label="Role name"
        required
      >
        <UiInput
          id="role-name"
          :model-value="createName"
          autocomplete="off"
          maxlength="128"
          required
          placeholder="Editors"
          @update:model-value="$emit('update:createName', $event)"
        />
      </UiField>
      <UiButton
        type="submit"
        :disabled="busy"
      >
        Create role
      </UiButton>
    </form>

    <UiEmptyState
      v-if="roles.length === 0"
      title="No roles"
      description="No roles are visible for this administration scope."
    />
    <UiTableFrame v-else>
      <table>
        <caption>Visible authorization roles</caption>
        <thead>
          <tr>
            <th scope="col">
              Name
            </th><th scope="col">
              Scope
            </th><th scope="col">
              Version
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="role in roles"
            :key="role.id"
          >
            <td>
              <UiButton
                type="button"
                variant="ghost"
                size="sm"
                :aria-pressed="role.id === selectedRoleId"
                @click="$emit('select', role.id)"
              >
                {{ role.name }}
              </UiButton>
              <small>{{ role.id }}</small>
            </td>
            <td>{{ role.owner_type }}</td>
            <td>
              <UiBadge :variant="role.id === selectedRoleId ? 'info' : 'neutral'">
                v{{ role.version }}
              </UiBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </UiTableFrame>
  </UiCard>
</template>

<style scoped>
.create-form { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
td small { display: block; margin-top: var(--space-1); color: var(--color-text-muted); font-size: var(--text-xs); }
@media (min-width: 48rem) {
  .create-form { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; }
}
</style>
