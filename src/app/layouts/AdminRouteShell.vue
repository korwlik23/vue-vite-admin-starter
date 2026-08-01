<script setup lang="ts">
import { RouterView } from "vue-router";

import AdminShell from "@/app/layouts/AdminShell.vue";
import Sidebar from "@/shared/components/shell/Sidebar.vue";
</script>

<template>
  <AdminShell>
    <template #navigation>
      <Sidebar
        :items="[
          { id: 'foundation', label: 'Foundation', href: '/' },
          { id: 'roles', label: 'Roles', href: '/authorization/roles' },
          { id: 'users', label: 'Users', href: '/users' },
          { id: 'memberships', label: 'Memberships', href: '/accounts/memberships' },
        ]"
      />
    </template>
    <RouterView />
  </AdminShell>
</template>
