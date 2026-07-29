<script setup lang="ts">
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
    <select
      :value="modelValue"
      @change="
        update(
          String(($event.target as unknown as { value: string }).value),
        )
      "
    >
      <option
        v-for="locale in locales"
        :key="locale.code"
        :value="locale.code"
      >
        {{ locale.name }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.locale-switcher {
  display: grid;
  gap: 0.2rem;
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
}

select {
  min-height: 2.75rem;
  padding-inline: 0.7rem;
  border: 1px solid #c8d0dc;
  border-radius: 0.65rem;
  color: inherit;
  background: transparent;
  font: inherit;
}
</style>
