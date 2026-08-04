<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
  }>(),
  {
    modelValue: false,
    id: "",
    name: "",
    disabled: false,
    required: false,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>

<template>
  <label class="ui-checkbox">
    <input
      v-bind="$attrs"
      :id="props.id || undefined"
      :name="props.name || undefined"
      type="checkbox"
      :checked="props.modelValue"
      :disabled="props.disabled"
      :required="props.required"
      @change="emit('update:modelValue', ($event.target as globalThis.HTMLInputElement).checked)"
    >
    <span><slot /></span>
  </label>
</template>

<style scoped>
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.ui-checkbox input {
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: #1d4ed8;
}
.ui-checkbox input:disabled { cursor: not-allowed; }
.ui-checkbox:has(input:disabled) { cursor: not-allowed; opacity: 0.6; }
</style>
