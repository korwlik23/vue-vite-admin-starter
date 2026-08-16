<script setup lang="ts">
import type { RoleAssignments } from "@/modules/authorization/api/roles.client";
import {
  UiButton, UiCard, UiEmptyState, UiField, UiInput, UiSelect, UiTableFrame,
} from "@/shared/components/ui";

defineProps<{
  assignments: RoleAssignments | undefined;
  assignmentScope: "account" | "system";
  assignmentAccountId: string;
  assignmentUserId: string;
  busy: boolean;
}>();
defineEmits<{
  "update:assignmentScope": [value: "account" | "system"];
  "update:assignmentAccountId": [value: string];
  "update:assignmentUserId": [value: string];
  assign: [];
  revoke: [assignmentId: string];
}>();

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
</script>

<template>
  <UiCard
    title="Principals"
    description="Assign or revoke this role"
  >
    <form
      class="assignment-form"
      aria-label="Assign role"
      @submit.prevent="$emit('assign')"
    >
      <UiField
        id="assignment-user-id"
        label="User ID"
        required
      >
        <UiInput
          id="assignment-user-id"
          :model-value="assignmentUserId"
          autocomplete="off"
          required
          placeholder="user-…"
          @update:model-value="$emit('update:assignmentUserId', $event)"
        />
      </UiField>
      <UiField
        id="assignment-scope"
        label="Scope"
      >
        <UiSelect
          id="assignment-scope"
          :model-value="assignmentScope"
          @update:model-value="$emit('update:assignmentScope', $event as 'account' | 'system')"
        >
          <option value="account">
            Account
          </option>
          <option value="system">
            System
          </option>
        </UiSelect>
      </UiField>
      <UiField
        v-if="assignmentScope === 'account'"
        id="assignment-account-id"
        label="Account ID"
        required
      >
        <UiInput
          id="assignment-account-id"
          :model-value="assignmentAccountId"
          autocomplete="off"
          required
          @update:model-value="$emit('update:assignmentAccountId', $event)"
        />
      </UiField>
      <UiButton
        type="submit"
        :disabled="busy"
      >
        Assign role
      </UiButton>
    </form>

    <UiTableFrame v-if="assignments && assignments.items.length > 0">
      <table>
        <caption>Principals assigned to the selected role</caption>
        <thead>
          <tr>
            <th scope="col">
              User ID
            </th><th scope="col">
              Scope
            </th><th scope="col">
              Created
            </th><th scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="assignment in assignments.items"
            :key="assignment.assignment_id"
          >
            <td class="mono">
              {{ assignment.user_id }}
            </td>
            <td>{{ assignment.scope }}</td>
            <td>{{ formatDate(assignment.created_at) }}</td>
            <td>
              <UiButton
                type="button"
                variant="danger"
                size="sm"
                :disabled="busy"
                :aria-label="`Revoke assignment ${assignment.user_id}`"
                @click="$emit('revoke', assignment.assignment_id)"
              >
                Revoke
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </UiTableFrame>
    <UiEmptyState
      v-else
      title="No assignments"
      description="No principals are assigned to this role."
    />
  </UiCard>
</template>

<style scoped>
.assignment-form { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
.mono { font-family: var(--font-mono); overflow-wrap: anywhere; }
@media (min-width: 48rem) {
  .assignment-form { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; }
}
</style>
