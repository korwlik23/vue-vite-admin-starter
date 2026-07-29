<script setup lang="ts">
import { computed } from "vue";

import {
  hasPermission,
  type PermissionCollection,
} from "@/shared/permissions/permissions";

const props = defineProps<{
  permission: string;
  permissions?: PermissionCollection;
}>();

const allowed = computed(() =>
  hasPermission(props.permissions, props.permission),
);
</script>

<template>
  <slot v-if="allowed" />
  <slot
    v-else
    name="fallback"
  />
</template>
