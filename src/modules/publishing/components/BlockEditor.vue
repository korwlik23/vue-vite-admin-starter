<script setup lang="ts">
import { ref } from "vue";

import type { PublishingBlock } from "@/modules/publishing/api/content.client";
import { validatePublishingBlocks } from "@/modules/publishing/schemas/content.schema";

const props = withDefaults(defineProps<{
  modelValue: readonly PublishingBlock[];
  disabled?: boolean;
  errors?: Record<string, string[]>;
}>(), { disabled: false, errors: () => ({}) });

const emit = defineEmits<{
  "update:modelValue": [value: PublishingBlock[]];
}>();

const newType = ref<PublishingBlock["type"]>("text");
const newData = ref('{\n  "text": ""\n}');
const editorErrors = ref<Record<string, string[]>>({});

function updateType(index: number, type: PublishingBlock["type"]): void {
  const blocks = props.modelValue.map((block, blockIndex) =>
    blockIndex === index ? { ...block, type } : block,
  );
  emit("update:modelValue", blocks);
}

function updateData(index: number, raw: string): void {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) throw new Error("structured object required");
    editorErrors.value = {};
    emit("update:modelValue", props.modelValue.map((block, blockIndex) =>
      blockIndex === index ? { ...block, data: parsed } : block,
    ));
  } catch {
    editorErrors.value = { [`blocks.${index}.data`]: ["Enter valid JSON object data."] };
  }
}

function removeBlock(index: number): void {
  emit("update:modelValue", props.modelValue.filter((_, blockIndex) => blockIndex !== index));
}

function addBlock(): void {
  try {
    const parsed: unknown = JSON.parse(newData.value);
    if (!isRecord(parsed)) throw new Error("structured object required");
    const next = [...props.modelValue, { type: newType.value, data: parsed }];
    const errors = validatePublishingBlocks(next);
    if (Object.keys(errors).some((key) => key === `blocks.${next.length - 1}.data` || key.startsWith(`blocks.${next.length - 1}.data.`))) {
      editorErrors.value = errors;
      return;
    }
    editorErrors.value = {};
    emit("update:modelValue", next);
    newData.value = '{\n  "text": ""\n}';
  } catch {
    editorErrors.value = { "new-block.data": ["Enter valid JSON object data."] };
  }
}

function errorFor(field: string): string | undefined {
  return editorErrors.value[field]?.[0] ?? props.errors[field]?.[0];
}

function formatData(block: PublishingBlock): string {
  return JSON.stringify(block.data, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
</script>

<template>
  <fieldset
    class="block-editor"
    :disabled="disabled"
  >
    <legend>Structured content blocks</legend>
    <p class="field-help">
      Blocks are stored as typed JSON objects. HTML is not accepted as a block type.
    </p>
    <p
      v-if="errors.blocks?.[0]"
      class="field-error"
      role="alert"
    >
      {{ errors.blocks[0] }}
    </p>
    <article
      v-for="(block, index) in modelValue"
      :key="`block-${index}`"
      class="block-card"
    >
      <header class="block-card-header">
        <h3>Block {{ index + 1 }}</h3>
        <button
          type="button"
          class="quiet-button"
          @click="removeBlock(index)"
        >
          Remove
        </button>
      </header>
      <label :for="`block-type-${index}`">Block type
        <select
          :id="`block-type-${index}`"
          :value="block.type"
          @change="updateType(index, ($event.target as HTMLSelectElement).value as PublishingBlock['type'])"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="callout">Callout</option>
          <option value="answer">Answer</option>
          <option value="steps">Steps</option>
          <option value="comparison">Comparison</option>
        </select>
      </label>
      <label :for="`block-data-${index}`">Structured data
        <textarea
          :id="`block-data-${index}`"
          :value="formatData(block)"
          rows="5"
          spellcheck="false"
          @change="updateData(index, ($event.target as HTMLTextAreaElement).value)"
        />
      </label>
      <p
        v-if="errorFor(`blocks.${index}.data`)"
        class="field-error"
        role="alert"
      >
        {{ errorFor(`blocks.${index}.data`) }}
      </p>
    </article>
    <div class="new-block">
      <label for="new-block-type">New block type
        <select
          id="new-block-type"
          v-model="newType"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="callout">Callout</option>
          <option value="answer">Answer</option>
          <option value="steps">Steps</option>
          <option value="comparison">Comparison</option>
        </select>
      </label>
      <label for="new-block-data">New block data
        <textarea
          id="new-block-data"
          v-model="newData"
          rows="4"
          spellcheck="false"
        />
      </label>
      <button
        type="button"
        @click="addBlock"
      >
        Add block
      </button>
      <p
        v-if="errorFor('new-block.data')"
        class="field-error"
        role="alert"
      >
        {{ errorFor("new-block.data") }}
      </p>
    </div>
  </fieldset>
</template>

<style scoped>
.block-editor { display: grid; gap: .75rem; min-width: 0; padding: 1rem; border: 1px solid #d5dbe5; border-radius: .8rem; }
legend { padding-inline: .35rem; color: #172033; font-weight: 750; }
.field-help { margin: 0; color: #526078; font-size: .84rem; line-height: 1.5; }
.block-card, .new-block { display: grid; gap: .65rem; padding: .85rem; border: 1px solid #e5e9f0; border-radius: .7rem; background: rgb(248 250 252 / 75%); }
.block-card-header { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
h3 { margin: 0; font-size: 1rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, textarea, button { min-height: 2.65rem; padding: .5rem .65rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
textarea { min-height: 7rem; resize: vertical; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .82rem; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
.quiet-button { min-height: 2.4rem; padding-inline: .7rem; }
.field-error { margin: 0; color: #9f1239; font-size: .82rem; font-weight: 650; }
</style>
