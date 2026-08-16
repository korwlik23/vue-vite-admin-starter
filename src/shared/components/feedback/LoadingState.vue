<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: "Loading" });
</script>

<template>
  <div
    class="feedback-state"
    role="status"
    aria-live="polite"
  >
    <span
      class="spinner"
      aria-hidden="true"
    />
    <p>{{ label }}</p>
  </div>
</template>

<style scoped>
.feedback-state {
  display: grid;
  min-height: calc(var(--space-16) * 3);
  place-items: center;
  align-content: center;
  gap: var(--space-3);
  color: var(--color-text-muted);
}

.spinner {
  width: var(--space-6);
  height: var(--space-6);
  border: 2px solid var(--color-border);
  border-top-color: var(--color-action);
  border-radius: var(--radius-pill);
  animation: spin var(--motion-standard) linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
