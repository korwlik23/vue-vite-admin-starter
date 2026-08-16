<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { RouterView } from "vue-router";

import AdminShell from "@/app/layouts/AdminShell.vue";
import Sidebar from "@/shared/components/shell/Sidebar.vue";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
}

const props = withDefaults(defineProps<{
  accountName?: string;
  navigationItems?: readonly NavigationItem[];
}>(), { navigationItems: () => [] });
</script>

<template>
  <AdminShell>
    <template #navigation>
      <Sidebar
        :items="props.navigationItems"
      />
    </template>
    <RouterView />
  </AdminShell>
</template>
