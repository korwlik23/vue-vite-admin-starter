<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    label: string;
    hint?: string | undefined;
    error?: string | undefined;
    required?: boolean;
  }>(),
  { hint: "", error: "", required: false },
);
</script>

<template>
  <div class="ui-field">
    <label :for="id">
      {{ label }}<span
        v-if="required"
        aria-hidden="true"
      > *</span>
    </label>
    <div class="ui-field__control">
      <slot />
    </div>
    <p
      v-if="error"
      :id="`${id}-error`"
      class="ui-field__error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      :id="`${id}-hint`"
      class="ui-field__hint"
    >
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.ui-field { display: grid; gap: var(--space-2); }
.ui-field label { color: var(--color-text); font-size: var(--text-sm); font-weight: 700; }
.ui-field__hint, .ui-field__error { margin: 0; font-size: var(--text-xs); line-height: var(--line-normal); }
.ui-field__hint { color: var(--color-text-muted); }
.ui-field__error { color: var(--color-danger); }
</style>
