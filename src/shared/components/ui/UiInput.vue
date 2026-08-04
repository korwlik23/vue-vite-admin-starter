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
  min-height: 2.75rem;
  border: 1px solid #cfd6e2;
  border-radius: 0.7rem;
  padding: 0.65rem 0.8rem;
  color: #172033;
  background: #fff;
  font: inherit;
}
.ui-input:focus { border-color: #2563eb; outline: 3px solid rgb(37 99 235 / 18%); }
.ui-input:disabled { cursor: not-allowed; opacity: 0.6; background: #f2f4f7; }
.ui-input--invalid { border-color: #b42318; }
</style>
