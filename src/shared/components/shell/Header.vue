<script setup lang="ts">
import UiButton from "@/shared/components/ui/UiButton.vue";

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
    <UiButton
      variant="ghost"
      size="sm"
      class="navigation-toggle"
      type="button"
      aria-label="Toggle navigation"
      aria-controls="admin-navigation"
      :aria-expanded="navigationOpen"
      @click="$emit('toggleNavigation')"
    >
      Menu
    </UiButton>
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
  gap: var(--space-4);
  min-height: var(--space-16);
  padding: var(--space-3) clamp(var(--space-4), 3vw, var(--space-8));
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-overlay);
}

.navigation-toggle {
  min-height: var(--control-height-md);
  padding-inline: var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: transparent;
}

.account-name {
  margin: var(--space-1) 0 0;
  color: var(--color-text);
  font-weight: 750;
}

@media (min-width: 64rem) {
  .navigation-toggle {
    display: none;
  }
}
</style>
