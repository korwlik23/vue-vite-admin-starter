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
    @change="$emit('change', $event)"
  >
</template>
