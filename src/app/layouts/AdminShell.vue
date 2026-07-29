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
  top: 0.75rem;
  left: 0.75rem;
  z-index: 100;
  padding: 0.75rem 1rem;
  color: white;
  background: #0f172a;
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
  padding: 1rem;
  border-right: 1px solid #d5dbe5;
  background: rgb(255 255 255 / 72%);
}

.admin-navigation[data-open="true"] {
  display: block;
}

main {
  min-width: 0;
  padding: clamp(1rem, 4vw, 3rem);
}

@media (min-width: 64rem) {
  .admin-body {
    grid-template-columns: 16rem minmax(0, 1fr);
  }

  .admin-navigation {
    display: block;
  }
}

@media (prefers-color-scheme: dark) {
  .admin-navigation {
    border-color: #293449;
    background: rgb(15 23 42 / 72%);
  }
}
</style>
