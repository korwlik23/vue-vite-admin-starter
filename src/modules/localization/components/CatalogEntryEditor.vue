<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  modelValue: Record<string, string>;
  filter?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, string>];
}>();

const newKey = ref("");
const newValue = ref("");
const entries = computed(() =>
  Object.entries(props.modelValue)
    .filter(([key]) => key.includes((props.filter ?? "").trim()))
    .sort(([left], [right]) => left.localeCompare(right)),
);

function update(key: string, value: string): void {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}

function remove(key: string): void {
  const next = { ...props.modelValue };
  delete next[key];
  emit("update:modelValue", next);
}

function add(): void {
  const key = newKey.value.trim();
  if (!key || Object.prototype.hasOwnProperty.call(props.modelValue, key)) return;
  emit("update:modelValue", { ...props.modelValue, [key]: newValue.value });
  newKey.value = "";
  newValue.value = "";
}
</script>

<template>
  <div class="entry-editor">
    <form
      class="add-entry"
      @submit.prevent="add"
    >
      <label>
        New key
        <input
          v-model="newKey"
          :disabled="disabled"
          placeholder="navigation.save"
        >
      </label>
      <label>
        Value
        <input
          v-model="newValue"
          :disabled="disabled"
          placeholder="Save"
        >
      </label>
      <button
        type="submit"
        :disabled="disabled || !newKey.trim()"
      >
        Add key
      </button>
    </form>
    <p
      v-if="entries.length === 0"
      class="empty"
    >
      No matching entries.
    </p>
    <div
      v-else
      class="entry-table-wrap"
    >
      <table>
        <caption class="sr-only">
          Translation entries
        </caption>
        <thead>
          <tr>
            <th scope="col">
              Key
            </th><th scope="col">
              Value
            </th><th scope="col">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="[key, value] in entries"
            :key="key"
          >
            <th scope="row">
              <code>{{ key }}</code>
            </th>
            <td>
              <input
                :value="value"
                :disabled="disabled"
                @input="update(key, ($event.target as HTMLInputElement).value)"
              >
            </td>
            <td>
              <button
                type="button"
                :disabled="disabled"
                @click="remove(key)"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.entry-editor { display: grid; gap: .8rem; }
.add-entry { display: flex; flex-wrap: wrap; align-items: end; gap: .65rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, button { min-height: 2.5rem; padding: .45rem .65rem; border: 1px solid #aeb9c9; border-radius: .5rem; background: white; font: inherit; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
.entry-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .65rem .5rem; border-bottom: 1px solid #e5e9f0; text-align: left; }
th { color: #526078; }
code { color: #344054; }
.empty { color: #667085; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
