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
  min-height: 7rem;
  resize: vertical;
  border: 1px solid #cfd6e2;
  border-radius: 0.7rem;
  padding: 0.7rem 0.8rem;
  color: #172033;
  background: #fff;
  font: inherit;
  line-height: 1.5;
}
.ui-textarea:focus { border-color: #2563eb; outline: 3px solid rgb(37 99 235 / 18%); }
.ui-textarea:disabled { cursor: not-allowed; opacity: 0.6; background: #f2f4f7; }
.ui-textarea--invalid { border-color: #b42318; }
</style>
