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
  gap: var(--space-2);
  min-height: 2.75rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding-inline: var(--space-4);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    filter var(--motion-fast) var(--ease-standard),
    background var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard);
}

.ui-button:hover:not(:disabled) { filter: brightness(0.96); }
.ui-button:focus-visible { outline-color: var(--color-focus); outline-offset: 2px; }
.ui-button:disabled { cursor: not-allowed; opacity: 0.55; }
.ui-button--sm { min-height: var(--control-height-sm); padding-inline: var(--space-3); font-size: var(--text-sm); }
.ui-button--lg { min-height: var(--control-height-lg); padding-inline: var(--space-5); }
.ui-button--primary { color: var(--color-text-inverse); background: var(--color-action); }
.ui-button--primary:hover:not(:disabled) { background: var(--color-action-hover); }
.ui-button--secondary { color: var(--color-text); border-color: var(--color-border); background: var(--color-surface); }
.ui-button--ghost { color: var(--color-action); background: transparent; }
.ui-button--danger { color: var(--color-text-inverse); background: var(--color-danger); }
.ui-button--danger:hover:not(:disabled) { background: var(--color-danger-hover); }
.ui-button__spinner {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-pill);
  animation: ui-spin 700ms linear infinite;
}

@keyframes ui-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .ui-button__spinner { animation: none; } }
</style>
