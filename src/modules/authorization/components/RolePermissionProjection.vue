<script setup lang="ts">
import type { RolePermissions } from "@/modules/authorization/api/roles.client";
import LoadingState from "@/shared/components/feedback/LoadingState.vue";
import { UiBadge, UiCard, UiEmptyState, UiTableFrame } from "@/shared/components/ui";

defineProps<{ permissions: RolePermissions | undefined; loading: boolean }>();
</script>

<template>
  <UiCard
    title="Permission projection"
    description="Effective keys granted to this role"
  >
    <LoadingState
      v-if="loading"
      label="Loading role details"
    />
    <UiTableFrame v-else-if="permissions && permissions.items.length > 0">
      <table>
        <caption>Permissions granted to the selected role</caption>
        <thead>
          <tr>
            <th scope="col">
              Permission key
            </th>
            <th scope="col">
              Tier
            </th>
            <th scope="col">
              State
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="permission in permissions.items"
            :key="permission.permission_key"
          >
            <td class="mono">
              {{ permission.permission_key }}
            </td>
            <td>{{ permission.tier }}</td>
            <td>
              <UiBadge :variant="permission.active ? 'success' : 'neutral'">
                {{ permission.active ? "Active" : "Inactive" }}
              </UiBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </UiTableFrame>
    <UiEmptyState
      v-else
      title="No permissions"
      description="No permissions are granted to this role."
    />
  </UiCard>
</template>

<style scoped>
.mono { font-family: var(--font-mono); overflow-wrap: anywhere; }
</style>
