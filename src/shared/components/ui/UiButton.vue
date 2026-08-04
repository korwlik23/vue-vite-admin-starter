<script setup lang="ts">
import { computed } from "vue";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
  }>(),
  {
    variant: "primary",
    size: "md",
    type: "button",
    disabled: false,
    loading: false,
    loadingLabel: "Loading…",
  },
);

const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
  <button
    :type="props.type"
    :disabled="isDisabled"
    :aria-busy="props.loading ? 'true' : undefined"
    :class="[
      'ui-button',
      `ui-button--${props.variant}`,
      `ui-button--${props.size}`,
    ]"
  >
    <span
      v-if="props.loading"
      class="ui-button__spinner"
      aria-hidden="true"
    />
    <span><template v-if="props.loading">{{ props.loadingLabel }}</template><slot v-else /></span>
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  padding-inline: 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: filter 150ms ease, background 150ms ease, border-color 150ms ease;
}

.ui-button:hover:not(:disabled) { filter: brightness(0.96); }
.ui-button:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }
.ui-button:disabled { cursor: not-allowed; opacity: 0.55; }
.ui-button--sm { min-height: 2.25rem; padding-inline: 0.75rem; font-size: 0.85rem; }
.ui-button--lg { min-height: 3.25rem; padding-inline: 1.25rem; }
.ui-button--primary { color: #fff; background: #1d4ed8; }
.ui-button--secondary { color: #172033; border-color: #cfd6e2; background: #fff; }
.ui-button--ghost { color: #1d4ed8; background: transparent; }
.ui-button--danger { color: #fff; background: #b42318; }
.ui-button__spinner {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ui-spin 700ms linear infinite;
}

@keyframes ui-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .ui-button__spinner { animation: none; } }
</style>
