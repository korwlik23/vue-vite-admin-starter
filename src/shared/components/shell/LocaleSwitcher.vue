<script setup lang="ts">
import UiSelect from "@/shared/components/ui/UiSelect.vue";

defineProps<{
  modelValue: string;
  locales: readonly { code: string; name: string }[];
}>();

const emit = defineEmits<{
  "update:modelValue": [locale: string];
}>();

function update(value: string): void {
  emit("update:modelValue", value);
}
</script>

<template>
  <label class="locale-switcher">
    <span>Language</span>
    <UiSelect
      :model-value="modelValue"
      @update:model-value="update(String($event))"
    >
      <option
        v-for="locale in locales"
        :key="locale.code"
        :value="locale.code"
      >
        {{ locale.name }}
      </option>
    </UiSelect>
  </label>
</template>

<style scoped>
.locale-switcher {
  display: grid;
  gap: var(--space-1);
  margin-left: auto;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 700;
}

</style>
