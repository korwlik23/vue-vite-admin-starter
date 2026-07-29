<script setup lang="ts">
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
    <button
      type="button"
      @click="retry"
    >
      Try again
    </button>
  </section>
</template>

<style scoped>
.feedback-state {
  max-width: 34rem;
  padding-block: 3rem;
}

button {
  min-height: 2.75rem;
  padding-inline: 1rem;
  border: 0;
  border-radius: 0.65rem;
  color: white;
  background: #172033;
  font-weight: 750;
}
</style>
