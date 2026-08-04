<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value: string;
    name?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    name: "",
    disabled: false,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <label class="ui-radio">
    <input
      v-bind="$attrs"
      :name="props.name || undefined"
      type="radio"
      :value="props.value"
      :checked="props.modelValue === props.value"
      :disabled="props.disabled"
      @change="emit('update:modelValue', props.value)"
    >
    <span><slot /></span>
  </label>
</template>

<style scoped>
.ui-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.ui-radio input { accent-color: #1d4ed8; }
.ui-radio input:disabled { cursor: not-allowed; }
.ui-radio:has(input:disabled) { cursor: not-allowed; opacity: 0.6; }
</style>
