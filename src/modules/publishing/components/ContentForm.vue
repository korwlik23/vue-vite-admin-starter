<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { reactive, ref } from "vue";

import BlockEditor from "@/modules/publishing/components/BlockEditor.vue";
import ContentMetadataFields from "@/modules/publishing/components/ContentMetadataFields.vue";
import ContentIdentityFields, { type ContentIdentityState } from "@/modules/publishing/components/ContentIdentityFields.vue";
import type { PublishingBlock } from "@/modules/publishing/api/content.client";
import type { ContentMutation } from "@/modules/publishing/schemas/content.schema";
import { parseContentMutation, type ValidationErrors } from "@/modules/publishing/schemas/content.schema";

type FormState = ContentIdentityState & {
  blocks: PublishingBlock[];
  seo: { title: string; description: string; canonical_url: string; robots: string };
  geo: { region: string; locality: string };
  aeo: { question: string; answer: string };
  expected_version: number | undefined;
};

const props = withDefaults(defineProps<{
  initial?: Partial<ContentMutation> | undefined;
  mode?: "create" | "edit";
  disabled?: boolean;
}>(), { mode: "create", disabled: false });

const emit = defineEmits<{
  submit: [value: ContentMutation];
  dirty: [value: boolean];
}>();

const state = reactive<FormState>(createState(props.initial));
const errors = ref<ValidationErrors>({});

function createState(initial: Partial<ContentMutation> | undefined): FormState {
  return {
    kind: initial?.kind === "post" ? "post" : "page",
    content_key: initial?.content_key ?? "",
    translation_id: initial?.translation_id ?? "",
    locale: initial?.locale ?? "en",
    slug: initial?.slug ?? "",
    path: initial?.path ?? "/",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    blocks: initial?.blocks ? [...initial.blocks] : [{ type: "text", data: { text: "Hello" } }],
    seo: {
      title: initial?.seo?.title ?? "",
      description: initial?.seo?.description ?? "",
      canonical_url: initial?.seo?.canonical_url ?? "",
      robots: initial?.seo?.robots ?? "index,follow",
    },
    geo: {
      region: initial?.geo?.region ?? "",
      locality: initial?.geo?.locality ?? "",
    },
    aeo: {
      question: initial?.aeo?.question ?? "",
      answer: initial?.aeo?.answer ?? "",
    },
    expected_version: initial?.expected_version,
  };
}

function markDirty(): void {
  emit("dirty", true);
}

function submit(): void {
  const candidate: ContentMutation = {
    kind: state.kind,
    content_key: state.content_key,
    locale: state.locale,
    slug: state.slug,
    path: state.path,
    title: state.title,
    excerpt: state.excerpt,
    blocks: state.blocks,
    seo: state.seo,
    geo: state.geo,
    aeo: state.aeo,
    ...(state.translation_id.trim() === "" ? {} : { translation_id: state.translation_id }),
    ...(state.expected_version === undefined ? {} : { expected_version: state.expected_version }),
  };
  const result = parseContentMutation(candidate);
  if (!result.success) {
    errors.value = result.errors;
    return;
  }
  if (props.mode === "create" && (!state.content_key.trim() || !state.kind)) {
    errors.value = { content_key: ["Content key and kind are required for new content."] };
    return;
  }
  if (props.mode === "edit" && (!state.translation_id || state.expected_version === undefined)) {
    errors.value = { translation_id: ["Translation and expected version are required for edits."] };
    return;
  }
  errors.value = {};
  emit("submit", result.data);
}

function errorFor(field: string): string | undefined {
  return errors.value[field]?.[0];
}
</script>

<template>
  <form
    class="content-form"
    aria-label="Content form"
    @submit.prevent="submit"
    @input="markDirty"
  >
    <p
      v-if="Object.keys(errors).length > 0"
      class="form-error-summary"
      role="alert"
      aria-live="assertive"
    >
      Review the highlighted fields before saving.
    </p>
    <ContentIdentityFields
      :model-value="state"
      :mode="mode"
      :error-for="errorFor"
      @update:model-value="Object.assign(state, $event); markDirty()"
    />
    <BlockEditor
      :model-value="state.blocks"
      :disabled="disabled"
      :errors="errors"
      @update:model-value="state.blocks = $event; markDirty()"
    />
    <ContentMetadataFields
      :seo="state.seo"
      :geo="state.geo"
      :aeo="state.aeo"
      @update:seo="state.seo = $event; markDirty()"
      @update:geo="state.geo = $event; markDirty()"
      @update:aeo="state.aeo = $event; markDirty()"
    />
    <label v-if="mode === 'edit'">Expected version<input
      v-model.number="state.expected_version"
      name="expected_version"
      type="number"
      min="1"
      required
    ><small v-if="errorFor('expected_version')">{{ errorFor("expected_version") }}</small></label>
    <button
      type="submit"
      :disabled="disabled"
    >
      {{ disabled ? "Saving…" : "Save content" }}
    </button>
  </form>
</template>

<style scoped>
.content-form { display: grid; gap: 1rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, textarea, button { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
textarea { resize: vertical; }
button { color: white; background: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
small, .form-error-summary { color: #9f1239; font-weight: 650; }
.form-error-summary { margin: 0; padding: .7rem .85rem; border: 1px solid #f0b5bd; border-radius: .55rem; background: #fff1f2; }
</style>
