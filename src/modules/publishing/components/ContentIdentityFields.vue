<script setup lang="ts">
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
    <label>Content type<select
      :value="modelValue.kind"
      name="kind"
      @change="update('kind', ($event.target as HTMLSelectElement).value)"
    ><option value="page">Page</option><option value="post">Post</option></select></label>
    <label>Locale<input
      name="locale"
      :value="modelValue.locale"
      required
      autocomplete="language"
      @input="update('locale', ($event.target as HTMLInputElement).value)"
    ><small v-if="errorFor('locale')">{{ errorFor("locale") }}</small></label>
    <label>Content key<input
      name="content_key"
      :value="modelValue.content_key"
      :required="mode === 'create'"
      placeholder="home"
      @input="update('content_key', ($event.target as HTMLInputElement).value)"
    ><small v-if="errorFor('content_key')">{{ errorFor("content_key") }}</small></label>
    <label>Translation ID<input
      name="translation_id"
      :value="modelValue.translation_id"
      :required="mode === 'edit'"
      autocomplete="off"
      @input="update('translation_id', ($event.target as HTMLInputElement).value)"
    ><small v-if="errorFor('translation_id')">{{ errorFor("translation_id") }}</small></label>
    <label>Slug<input
      name="slug"
      :value="modelValue.slug"
      required
      placeholder="home"
      @input="update('slug', ($event.target as HTMLInputElement).value)"
    ><small v-if="errorFor('slug')">{{ errorFor("slug") }}</small></label>
    <label>Path<input
      name="path"
      :value="modelValue.path"
      required
      placeholder="/home"
      @input="update('path', ($event.target as HTMLInputElement).value)"
    ><small v-if="errorFor('path')">{{ errorFor("path") }}</small></label>
  </div>
  <label>Title<input
    name="title"
    :value="modelValue.title"
    required
    autocomplete="off"
    @input="update('title', ($event.target as HTMLInputElement).value)"
  ><small v-if="errorFor('title')">{{ errorFor("title") }}</small></label>
  <label>Excerpt<textarea
    name="excerpt"
    :value="modelValue.excerpt"
    rows="3"
    @input="update('excerpt', ($event.target as HTMLTextAreaElement).value)"
  /><small v-if="errorFor('excerpt')">{{ errorFor("excerpt") }}</small></label>
</template>

<style scoped>
.form-grid { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, textarea { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
textarea { resize: vertical; }
small { color: #9f1239; font-weight: 650; }
</style>
