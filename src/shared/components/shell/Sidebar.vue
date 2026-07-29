<script setup lang="ts">
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
      <a
        :href="item.href"
        :aria-current="item.current ? 'page' : undefined"
      >
        {{ item.label }}
      </a>
    </li>
  </ul>
</template>

<style scoped>
.sidebar-list {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

a {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  padding-inline: 0.8rem;
  border-radius: 0.65rem;
  color: inherit;
  text-decoration: none;
}

a[aria-current="page"] {
  color: white;
  background: #172033;
}
</style>
