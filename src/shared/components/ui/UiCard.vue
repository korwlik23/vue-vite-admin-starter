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
.ui-card { border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 88%); box-shadow: 0 0.75rem 2rem rgb(16 24 40 / 6%); }
.ui-card__header { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 1.1rem 0; }
.ui-card__header h2 { margin: 0; color: #101828; font-size: 1.05rem; }
.ui-card__header p { margin: 0.35rem 0 0; color: #667085; font-size: 0.9rem; }
.ui-card__body { padding: 1.1rem; }
.ui-card__footer { display: flex; justify-content: flex-end; gap: 0.6rem; padding: 0 1.1rem 1.1rem; }
@media (prefers-color-scheme: dark) { .ui-card { border-color: #293449; background: rgb(15 23 42 / 88%); } .ui-card__header h2 { color: #f8fafc; } .ui-card__header p { color: #aab5c7; } }
</style>
