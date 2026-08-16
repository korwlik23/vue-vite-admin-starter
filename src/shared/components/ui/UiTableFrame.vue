<template>
  <div class="ui-table-frame">
    <slot />
  </div>
</template>

<style scoped>
.ui-table-frame {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.ui-table-frame :deep(table) { width: 100%; border-collapse: collapse; }
.ui-table-frame :deep(caption) { padding: var(--space-3); color: var(--color-text-muted); text-align: start; }
.ui-table-frame :deep(th),
.ui-table-frame :deep(td) { padding: var(--space-3); border-bottom: 1px solid var(--color-border); text-align: start; vertical-align: top; }
.ui-table-frame :deep(th) { color: var(--color-text-muted); font-size: var(--text-xs); text-transform: uppercase; }
.ui-table-frame :deep(tbody tr:last-child td) { border-bottom: 0; }
</style>
