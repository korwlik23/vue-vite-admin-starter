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
.ui-empty-state { display: grid; justify-items: center; gap: 0.6rem; padding: 2rem 1.25rem; border: 1px dashed #cfd6e2; border-radius: 0.9rem; text-align: center; }
.ui-empty-state__icon { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; color: #1d4ed8; background: #dbeafe; font-size: 1.5rem; }
.ui-empty-state h2, .ui-empty-state p { margin: 0; }
.ui-empty-state h2 { color: #344054; font-size: 1.05rem; }
.ui-empty-state p { max-width: 34rem; color: #667085; line-height: 1.5; }
.ui-empty-state__action { margin-top: 0.35rem; }
</style>
