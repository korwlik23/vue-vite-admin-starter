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
.ui-field { display: grid; gap: 0.45rem; }
.ui-field label { color: #344054; font-size: 0.87rem; font-weight: 700; }
.ui-field__hint, .ui-field__error { margin: 0; font-size: 0.82rem; line-height: 1.4; }
.ui-field__hint { color: #667085; }
.ui-field__error { color: #b42318; }
</style>
