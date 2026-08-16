<script setup lang="ts">
withDefaults(defineProps<{ title: string; description?: string }>(), { description: "" });
</script>

<template>
  <header class="ui-page-header">
    <div class="ui-page-header__copy">
      <h1>{{ title }}</h1>
      <p v-if="description">
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="ui-page-header__actions"
    >
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.ui-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.ui-page-header__copy { display: grid; gap: var(--space-2); }
.ui-page-header h1 { margin: 0; color: var(--color-text); font-size: var(--text-2xl); line-height: var(--line-tight); }
.ui-page-header p { max-width: var(--content-reading); margin: 0; color: var(--color-text-muted); line-height: var(--line-normal); }
.ui-page-header__actions { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
</style>
