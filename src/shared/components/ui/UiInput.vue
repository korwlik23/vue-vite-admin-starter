<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    id?: string;
    name?: string;
    type?: "text" | "email" | "password" | "search" | "url" | "number" | "datetime-local";
    placeholder?: string;
    modelModifiers?: { trim?: boolean };
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
  }>(),
  {
    modelValue: "",
    id: "",
    name: "",
    type: "text",
    placeholder: "",
    modelModifiers: () => ({}),
    disabled: false,
    required: false,
    invalid: false,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

function inputValue(event: globalThis.Event): string {
  const value = (event.target as globalThis.HTMLInputElement).value;
  return props.modelModifiers.trim ? value.trim() : value;
}
</script>

<template>
  <input
    v-bind="$attrs"
    :id="props.id"
    :name="props.name"
    :type="props.type"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :required="props.required"
    :aria-invalid="props.invalid ? 'true' : undefined"
    :class="['ui-input', { 'ui-input--invalid': props.invalid }]"
    @input="emit('update:modelValue', inputValue($event))"
  >
</template>

<style scoped>
.ui-input {
  width: 100%;
  min-height: var(--control-height-md);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text);
  background: var(--color-surface);
  font: inherit;
}
.ui-input:focus-visible { border-color: var(--color-focus); outline: none; box-shadow: var(--focus-ring); }
.ui-input:disabled { cursor: not-allowed; opacity: 0.6; background: var(--color-surface-subtle); }
.ui-input--invalid { border-color: var(--color-danger); }
</style>
