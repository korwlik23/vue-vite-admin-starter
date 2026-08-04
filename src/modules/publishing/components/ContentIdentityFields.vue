<script setup lang="ts">
import UiInput from "@/shared/components/ui/UiInput.vue";
import UiSelect from "@/shared/components/ui/UiSelect.vue";
import UiTextarea from "@/shared/components/ui/UiTextarea.vue";

export interface ContentIdentityState {
  kind: "page" | "post";
  content_key: string;
  translation_id: string;
  locale: string;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
}

defineProps<{
  modelValue: ContentIdentityState;
  mode: "create" | "edit";
  errorFor: (field: string) => string | undefined;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Partial<ContentIdentityState>];
}>();

function update(field: keyof ContentIdentityState, value: string): void {
  emit("update:modelValue", { [field]: value });
}
</script>

<template>
  <div class="form-grid">
    <label>Content type<UiSelect
      :model-value="modelValue.kind"
      name="kind"
      @update:model-value="update('kind', String($event))"
    ><option value="page">Page</option><option value="post">Post</option></UiSelect></label>
    <label>Locale<UiInput
      name="locale"
      :model-value="modelValue.locale"
      required
      autocomplete="language"
      @update:model-value="update('locale', $event)"
    /><small v-if="errorFor('locale')">{{ errorFor("locale") }}</small></label>
    <label>Content key<UiInput
      name="content_key"
      :model-value="modelValue.content_key"
      :required="mode === 'create'"
      placeholder="home"
      @update:model-value="update('content_key', $event)"
    /><small v-if="errorFor('content_key')">{{ errorFor("content_key") }}</small></label>
    <label>Translation ID<UiInput
      name="translation_id"
      :model-value="modelValue.translation_id"
      :required="mode === 'edit'"
      autocomplete="off"
      @update:model-value="update('translation_id', $event)"
    /><small v-if="errorFor('translation_id')">{{ errorFor("translation_id") }}</small></label>
    <label>Slug<UiInput
      name="slug"
      :model-value="modelValue.slug"
      required
      placeholder="home"
      @update:model-value="update('slug', $event)"
    /><small v-if="errorFor('slug')">{{ errorFor("slug") }}</small></label>
    <label>Path<UiInput
      name="path"
      :model-value="modelValue.path"
      required
      placeholder="/home"
      @update:model-value="update('path', $event)"
    /><small v-if="errorFor('path')">{{ errorFor("path") }}</small></label>
  </div>
  <label>Title<UiInput
    name="title"
    :model-value="modelValue.title"
    required
    autocomplete="off"
    @update:model-value="update('title', $event)"
  /><small v-if="errorFor('title')">{{ errorFor("title") }}</small></label>
  <label>Excerpt<UiTextarea
    name="excerpt"
    :model-value="modelValue.excerpt"
    :rows="3"
    @update:model-value="update('excerpt', $event)"
  /><small v-if="errorFor('excerpt')">{{ errorFor("excerpt") }}</small></label>
</template>

<style scoped>
.form-grid { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, textarea { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
textarea { resize: vertical; }
small { color: #9f1239; font-weight: 650; }
</style>
