<script setup lang="ts">
import type {
  Role, RoleAssignments, RolePermissions,
} from "@/modules/authorization/api/roles.client";
import RoleAssignmentsPanel from "@/modules/authorization/components/RoleAssignmentsPanel.vue";
import RolePermissionProjection from "@/modules/authorization/components/RolePermissionProjection.vue";
import RoleSummaryPanel from "@/modules/authorization/components/RoleSummaryPanel.vue";

defineProps<{
  role: Role;
  permissions: RolePermissions | undefined;
  assignments: RoleAssignments | undefined;
  detailLoading: boolean;
  busy: boolean;
  renameName: string;
  assignmentScope: "account" | "system";
  assignmentAccountId: string;
  assignmentUserId: string;
}>();
defineEmits<{
  "update:renameName": [value: string];
  "update:assignmentScope": [value: "account" | "system"];
  "update:assignmentAccountId": [value: string];
  "update:assignmentUserId": [value: string];
  rename: [];
  assign: [];
  revoke: [assignmentId: string];
}>();
</script>

<template>
  <section
    class="detail-stack"
    aria-label="Selected role details"
  >
    <RoleSummaryPanel
      :role="role"
      :rename-name="renameName"
      :busy="busy"
      @update:rename-name="$emit('update:renameName', $event)"
      @rename="$emit('rename')"
    />
    <RolePermissionProjection
      :permissions="permissions"
      :loading="detailLoading"
    />
    <RoleAssignmentsPanel
      :assignments="assignments"
      :assignment-scope="assignmentScope"
      :assignment-account-id="assignmentAccountId"
      :assignment-user-id="assignmentUserId"
      :busy="busy"
      @update:assignment-scope="$emit('update:assignmentScope', $event)"
      @update:assignment-account-id="$emit('update:assignmentAccountId', $event)"
      @update:assignment-user-id="$emit('update:assignmentUserId', $event)"
      @assign="$emit('assign')"
      @revoke="$emit('revoke', $event)"
    />
  </section>
</template>

<style scoped>
.detail-stack { display: grid; gap: var(--space-4); min-width: 0; }
</style>
