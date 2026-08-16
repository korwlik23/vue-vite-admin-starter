<script setup lang="ts">
const props = withDefaults(
  defineProps<{ modelValue?: string; rows?: number; disabled?: boolean; invalid?: boolean }>(),
  { modelValue: "", rows: 4, disabled: false, invalid: false },
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <textarea
    v-bind="$attrs"
    :value="props.modelValue"
    :rows="props.rows"
    :disabled="props.disabled"
    :aria-invalid="props.invalid ? 'true' : undefined"
    :class="['ui-textarea', { 'ui-textarea--invalid': props.invalid }]"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<style scoped>
.ui-textarea {
  width: 100%;
  min-height: calc(var(--control-height-md) * 2.5);
  resize: vertical;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  color: var(--color-text);
  background: var(--color-surface);
  font: inherit;
  line-height: var(--line-normal);
}
.ui-textarea:focus-visible { border-color: var(--color-focus); outline: none; box-shadow: var(--focus-ring); }
.ui-textarea:disabled { cursor: not-allowed; opacity: 0.6; background: var(--color-surface-subtle); }
.ui-textarea--invalid { border-color: var(--color-danger); }
</style>
