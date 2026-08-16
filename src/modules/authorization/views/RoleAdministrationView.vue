<script setup lang="ts">
import RoleDetailsPanel from "@/modules/authorization/components/RoleDetailsPanel.vue";
import RoleDirectoryPanel from "@/modules/authorization/components/RoleDirectoryPanel.vue";
import { useRoleAdministration } from "@/modules/authorization/composables/useRoleAdministration";
import type { APIClient } from "@/shared/api/client";
import LoadingState from "@/shared/components/feedback/LoadingState.vue";
import {
  UiAlert,
  UiBadge,
  UiButton,
  UiEmptyState,
  UiPage,
  UiPageHeader,
} from "@/shared/components/ui";

const props = defineProps<{
  client: APIClient;
  accountID?: string | (() => string | undefined);
}>();

const state = useRoleAdministration(props.client, props.accountID);
</script>

<template>
  <UiPage aria-labelledby="role-administration-title">
    <UiPageHeader
      title="Role administration"
      description="Manage account-owned roles, review their permission projection, and maintain principal assignments."
    >
      <template #actions>
        <UiBadge variant="info">
          Language-neutral Admin URLs
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
      v-if="state.formError.value"
      variant="danger"
    >
      {{ state.formError.value }}
    </UiAlert>
    <UiAlert
      v-if="state.errorMessage.value"
      variant="danger"
    >
      {{ state.errorMessage.value }}
    </UiAlert>

    <LoadingState
      v-if="state.loading.value"
      label="Loading roles"
    />
    <UiEmptyState
      v-else-if="state.errorMessage.value && state.roles.value.length === 0"
      title="Roles unavailable"
      description="The role directory could not be loaded."
    >
      <template #action>
        <UiButton
          type="button"
          @click="state.loadRoles"
        >
          Try again
        </UiButton>
      </template>
    </UiEmptyState>
    <div
      v-else
      class="role-layout"
    >
      <RoleDirectoryPanel
        v-model:account-id="state.accountId.value"
        v-model:create-name="state.createName.value"
        :roles="state.roles.value"
        :selected-role-id="state.selectedRoleId.value"
        :busy="state.busy.value"
        @create="state.submitCreateRole"
        @select="state.selectRole"
      />
      <RoleDetailsPanel
        v-if="state.selectedRole.value"
        v-model:assignment-account-id="state.assignmentAccountId.value"
        v-model:assignment-scope="state.assignmentScope.value"
        v-model:assignment-user-id="state.assignmentUserId.value"
        v-model:rename-name="state.renameName.value"
        :role="state.selectedRole.value"
        :permissions="state.permissions.value"
        :assignments="state.assignments.value"
        :detail-loading="state.detailLoading.value"
        :busy="state.busy.value"
        @assign="state.submitAssignment"
        @rename="state.submitRenameRole"
        @revoke="state.removeAssignment"
      />
      <UiEmptyState
        v-else
        title="Select a role"
        description="Choose a role to inspect permissions and assignments."
      />
    </div>
  </UiPage>
</template>

<style scoped>
.role-layout {
  display: grid;
  grid-template-columns: minmax(20rem, 0.85fr) minmax(28rem, 1.15fr);
  align-items: start;
  gap: var(--space-4);
}
@media (max-width: 72rem) {
  .role-layout { grid-template-columns: minmax(0, 1fr); }
}
</style>
