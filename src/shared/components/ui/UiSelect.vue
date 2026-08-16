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
  min-height: var(--control-height-md);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text);
  background: var(--color-surface);
  font: inherit;
}
.ui-select:focus-visible { border-color: var(--color-focus); outline: none; box-shadow: var(--focus-ring); }
.ui-select:disabled { cursor: not-allowed; opacity: 0.6; background: var(--color-surface-subtle); }
.ui-select--invalid { border-color: var(--color-danger); }
</style>
