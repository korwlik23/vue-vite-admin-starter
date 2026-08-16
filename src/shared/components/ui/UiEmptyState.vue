<script setup lang="ts">
withDefaults(defineProps<{ title: string; description?: string }>(), { description: "" });
</script>

<template>
  <div
    class="ui-empty-state"
    role="status"
  >
    <div
      class="ui-empty-state__icon"
      aria-hidden="true"
    >
      ◎
    </div>
    <h2>{{ title }}</h2>
    <p v-if="description">
      {{ description }}
    </p>
    <div
      v-if="$slots.action"
      class="ui-empty-state__action"
    >
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.ui-empty-state { display: grid; justify-items: center; gap: var(--space-3); padding: var(--space-8) var(--space-5); border: 1px dashed var(--color-border-strong); border-radius: var(--radius-lg); text-align: center; }
.ui-empty-state__icon { display: grid; place-items: center; width: var(--space-10); height: var(--space-10); border-radius: var(--radius-pill); color: var(--color-action); background: var(--color-action-soft); font-size: var(--text-xl); }
.ui-empty-state h2, .ui-empty-state p { margin: 0; }
.ui-empty-state h2 { color: var(--color-text); font-size: var(--text-lg); }
.ui-empty-state p { max-width: var(--content-reading); color: var(--color-text-muted); line-height: var(--line-normal); }
.ui-empty-state__action { margin-top: var(--space-1); }
</style>
