<template>
  <div
    class="ui-toolbar"
    role="toolbar"
  >
    <slot />
  </div>
</template>

<style scoped>
.ui-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-subtle);
}
</style>
