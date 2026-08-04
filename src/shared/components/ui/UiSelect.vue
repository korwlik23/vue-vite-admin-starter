<script setup lang="ts">
const props = withDefaults(
  defineProps<{ modelValue?: string | number; disabled?: boolean; invalid?: boolean }>(),
  { modelValue: "", disabled: false, invalid: false },
);
const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();

function selectedValue(event: globalThis.Event): string | number {
  const select = event.target as globalThis.HTMLSelectElement;
  const option = select.selectedOptions[0] as (globalThis.HTMLOptionElement & { _value?: unknown }) | undefined;
  const value = option?._value;
  return typeof value === "string" || typeof value === "number"
    ? value
    : select.value;
}
</script>

<template>
  <select
    v-bind="$attrs"
    :value="props.modelValue"
    :disabled="props.disabled"
    :aria-invalid="props.invalid ? 'true' : undefined"
    :class="['ui-select', { 'ui-select--invalid': props.invalid }]"
    @change="emit('update:modelValue', selectedValue($event))"
  >
    <slot />
  </select>
</template>

<style scoped>
.ui-select {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid #cfd6e2;
  border-radius: 0.7rem;
  padding: 0.65rem 0.8rem;
  color: #172033;
  background: #fff;
  font: inherit;
}
.ui-select:focus { border-color: #2563eb; outline: 3px solid rgb(37 99 235 / 18%); }
.ui-select:disabled { cursor: not-allowed; opacity: 0.6; background: #f2f4f7; }
.ui-select--invalid { border-color: #b42318; }
</style>
