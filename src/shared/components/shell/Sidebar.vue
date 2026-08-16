<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
  items: readonly {
    id: string;
    label: string;
    href: string;
    current?: boolean;
  }[];
}>();
</script>

<template>
  <ul class="sidebar-list">
    <li
      v-for="item in items"
      :key="item.id"
    >
      <RouterLink
        v-slot="{ href, navigate, isExactActive }"
        :to="item.href"
        custom
      >
        <a
          :href="href"
          :aria-current="isExactActive ? 'page' : undefined"
          @click="navigate"
        >
          {{ item.label }}
        </a>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped>
.sidebar-list {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

a {
  display: flex;
  min-height: var(--control-height-md);
  align-items: center;
  padding-inline: var(--space-3);
  border-radius: var(--radius-md);
  color: inherit;
  text-decoration: none;
}

a[aria-current="page"] {
  color: var(--color-text-inverse);
  background: var(--color-action);
}
</style>
