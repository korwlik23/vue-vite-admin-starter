<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: "",
  description: "",
});
</script>

<template>
  <section class="ui-card">
    <header
      v-if="title || description || $slots.header"
      class="ui-card__header"
    >
      <slot name="header">
        <div>
          <h2 v-if="title">
            {{ title }}
          </h2>
          <p v-if="description">
            {{ description }}
          </p>
        </div>
      </slot>
    </header>
    <div class="ui-card__body">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      class="ui-card__footer"
    >
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.ui-card { border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface-overlay); box-shadow: var(--shadow-surface); }
.ui-card__header { display: flex; justify-content: space-between; gap: var(--space-4); padding: var(--space-5) var(--space-5) 0; }
.ui-card__header h2 { margin: 0; color: var(--color-text); font-size: var(--text-lg); }
.ui-card__header p { margin: var(--space-1) 0 0; color: var(--color-text-muted); font-size: var(--text-sm); }
.ui-card__body { padding: var(--space-5); }
.ui-card__footer { display: flex; justify-content: flex-end; gap: var(--space-2); padding: 0 var(--space-5) var(--space-5); }
</style>
