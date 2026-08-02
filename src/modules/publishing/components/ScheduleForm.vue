<script setup lang="ts">
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
      <label>Translation ID<input
        name="translation_id"
        :value="modelValue.translation_id"
        required
        autocomplete="off"
        @input="update('translation_id', ($event.target as HTMLInputElement).value)"
      ></label>
      <label>Publish at<input
        name="publish_at"
        type="datetime-local"
        :value="modelValue.publish_at"
        required
        @input="update('publish_at', ($event.target as HTMLInputElement).value)"
      ></label>
      <label>Unpublish at<input
        name="unpublish_at"
        type="datetime-local"
        :value="modelValue.unpublish_at"
        @input="update('unpublish_at', ($event.target as HTMLInputElement).value)"
      ></label>
      <label>Expected version<input
        name="expected_version"
        type="number"
        min="1"
        required
        :value="modelValue.expected_version"
        @input="update('expected_version', Number(($event.target as HTMLInputElement).value))"
      ></label>
      <label>Idempotency key<input
        name="idempotency_key"
        :value="modelValue.idempotency_key"
        placeholder="Generated if empty"
        autocomplete="off"
        @input="update('idempotency_key', ($event.target as HTMLInputElement).value)"
      ></label>
    </div>
    <button
      type="submit"
      :disabled="disabled"
    >
      {{ disabled ? "Creating…" : "Create schedule" }}
    </button>
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
