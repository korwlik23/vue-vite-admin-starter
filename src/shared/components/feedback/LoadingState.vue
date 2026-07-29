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
  min-height: 12rem;
  place-items: center;
  align-content: center;
  gap: 0.8rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #cbd5e1;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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
