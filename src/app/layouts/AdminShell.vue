<script setup lang="ts">
import { ref } from "vue";

import Header from "@/shared/components/shell/Header.vue";

defineProps<{
  accountName?: string | undefined;
}>();

const navigationOpen = ref(false);
</script>

<template>
  <a
    class="skip-link"
    href="#admin-main"
  >
    Skip to content
  </a>
  <div
    class="admin-shell"
    @keydown.esc="navigationOpen = false"
  >
    <Header
      :account-name="accountName"
      :navigation-open="navigationOpen"
      @toggle-navigation="navigationOpen = !navigationOpen"
    >
      <slot name="header" />
    </Header>
    <div class="admin-body">
      <nav
        id="admin-navigation"
        class="admin-navigation"
        :data-open="navigationOpen"
        aria-label="Primary navigation"
      >
        <slot name="navigation" />
      </nav>
      <main
        id="admin-main"
        tabindex="-1"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: var(--space-3);
  inset-inline-start: var(--space-3);
  z-index: 100;
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-inverse);
  background: var(--color-action);
  border-radius: var(--radius-md);
  transform: translateY(-180%);
}

.skip-link:focus {
  transform: translateY(0);
}

.admin-shell {
  min-height: 100vh;
}

.admin-body {
  display: grid;
  min-height: calc(100vh - 4.5rem);
}

.admin-navigation {
  display: none;
  padding: var(--space-4);
  border-inline-end: 1px solid var(--color-border);
  background: var(--color-surface-overlay);
}

.admin-navigation[data-open="true"] {
  display: block;
}

main {
  min-width: 0;
  padding: clamp(var(--space-4), 4vw, var(--space-12));
}

@media (min-width: 64rem) {
  .admin-body {
    grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  }

  .admin-navigation {
    display: block;
  }
}

</style>
