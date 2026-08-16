<script setup lang="ts">
import UiButton from "@/shared/components/ui/UiButton.vue";

defineProps<{
  retry: () => void;
  message?: string;
}>();
</script>

<template>
  <section
    class="feedback-state"
    aria-labelledby="error-title"
  >
    <h1 id="error-title">
      We could not load this page
    </h1>
    <p>{{ message || "Check your connection and try again." }}</p>
    <UiButton
      type="button"
      @click="retry"
    >
      Try again
    </UiButton>
  </section>
</template>

<style scoped>
.feedback-state {
  display: grid;
  max-width: var(--content-reading);
  gap: var(--space-4);
  padding-block: var(--space-12);
}
.feedback-state h1, .feedback-state p { margin: 0; }
.feedback-state p { color: var(--color-text-muted); }
</style>
