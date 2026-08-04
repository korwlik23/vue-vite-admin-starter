<script setup lang="ts">
import UiButton from "@/shared/components/ui/UiButton.vue";
import UiInput from "@/shared/components/ui/UiInput.vue";

export interface ScheduleDraft {
  translation_id: string;
  publish_at: string;
  unpublish_at: string;
  expected_version: number;
  idempotency_key: string;
}

const props = defineProps<{
  modelValue: ScheduleDraft;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: ScheduleDraft];
  submit: [];
}>();

function update(field: keyof ScheduleDraft, value: string | number): void {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
}
</script>

<template>
  <form
    class="panel schedule-form"
    aria-label="Create publication schedule"
    @submit.prevent="emit('submit')"
  >
    <h2>Create schedule</h2>
    <div class="form-grid">
      <label>Translation ID<UiInput
        name="translation_id"
        :model-value="modelValue.translation_id"
        required
        autocomplete="off"
        @update:model-value="update('translation_id', $event)"
      /></label>
      <label>Publish at<UiInput
        name="publish_at"
        type="datetime-local"
        :model-value="modelValue.publish_at"
        required
        @update:model-value="update('publish_at', $event)"
      /></label>
      <label>Unpublish at<UiInput
        name="unpublish_at"
        type="datetime-local"
        :model-value="modelValue.unpublish_at"
        @update:model-value="update('unpublish_at', $event)"
      /></label>
      <label>Expected version<UiInput
        name="expected_version"
        type="number"
        min="1"
        required
        :model-value="modelValue.expected_version"
        @update:model-value="update('expected_version', Number($event))"
      /></label>
      <label>Idempotency key<UiInput
        name="idempotency_key"
        :model-value="modelValue.idempotency_key"
        placeholder="Generated if empty"
        autocomplete="off"
        @update:model-value="update('idempotency_key', $event)"
      /></label>
    </div>
    <UiButton
      :loading="disabled"
      loading-label="Creating…"
      type="submit"
      :disabled="disabled"
    >
      Create schedule
    </UiButton>
  </form>
</template>

<style scoped>
.schedule-form { display: grid; gap: .8rem; margin-bottom: 1rem; }
h2 { margin: 0; color: #172033; font-size: 1.2rem; }
.form-grid { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, button { min-height: 2.75rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .55; }
</style>
