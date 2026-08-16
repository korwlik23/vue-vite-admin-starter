<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    accept?: string;
    disabled?: boolean;
    multiple?: boolean;
  }>(),
  { id: "", name: "", accept: "", disabled: false, multiple: false },
);

defineEmits<{
  change: [event: globalThis.Event];
}>();
</script>

<template>
  <input
    v-bind="$attrs"
    :id="id"
    :name="name"
    type="file"
    :accept="accept"
    :disabled="disabled"
    :multiple="multiple"
    class="ui-file-input"
    @change="$emit('change', $event)"
  >
</template>

<style scoped>
.ui-file-input {
  width: 100%;
  min-height: var(--control-height-md);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-muted);
  background: var(--color-surface);
  font: inherit;
}
.ui-file-input:focus-visible { border-color: var(--color-focus); outline: none; box-shadow: var(--focus-ring); }
.ui-file-input:disabled { cursor: not-allowed; opacity: 0.6; background: var(--color-surface-subtle); }
</style>
