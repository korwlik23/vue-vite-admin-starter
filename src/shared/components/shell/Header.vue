<script setup lang="ts">
defineProps<{
  accountName?: string | undefined;
  navigationOpen?: boolean;
}>();

defineEmits<{
  toggleNavigation: [];
}>();
</script>

<template>
  <header class="admin-header">
    <button
      class="navigation-toggle"
      type="button"
      aria-label="Toggle navigation"
      aria-controls="admin-navigation"
      :aria-expanded="navigationOpen"
      @click="$emit('toggleNavigation')"
    >
      Menu
    </button>
    <div>
      <p class="eyebrow">
        TEWARACH · ADMIN
      </p>
      <p class="account-name">
        {{ accountName || "Workspace" }}
      </p>
    </div>
    <slot />
  </header>
</template>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 4.5rem;
  padding: 0.8rem clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid #d5dbe5;
  background: rgb(255 255 255 / 90%);
}

.navigation-toggle {
  min-height: 2.75rem;
  padding-inline: 0.9rem;
  border: 1px solid #c8d0dc;
  border-radius: 0.65rem;
  background: transparent;
}

.account-name {
  margin: 0.15rem 0 0;
  font-weight: 750;
}

@media (min-width: 64rem) {
  .navigation-toggle {
    display: none;
  }
}
</style>
