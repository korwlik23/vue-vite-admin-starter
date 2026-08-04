<script setup lang="ts">
import type { ContentMutation } from "@/modules/publishing/schemas/content.schema";
import UiInput from "@/shared/components/ui/UiInput.vue";
import UiTextarea from "@/shared/components/ui/UiTextarea.vue";

defineProps<{
  seo: NonNullable<ContentMutation["seo"]>;
  geo: NonNullable<ContentMutation["geo"]>;
  aeo: NonNullable<ContentMutation["aeo"]>;
}>();

const emit = defineEmits<{
  "update:seo": [value: NonNullable<ContentMutation["seo"]>];
  "update:geo": [value: NonNullable<ContentMutation["geo"]>];
  "update:aeo": [value: NonNullable<ContentMutation["aeo"]>];
}>();
</script>

<template>
  <fieldset class="metadata-grid">
    <legend>SEO</legend>
    <label>SEO title<UiInput
      :model-value="seo.title"
      name="seo_title"
      @update:model-value="emit('update:seo', { ...seo, title: $event })"
    /></label>
    <label>SEO description<UiTextarea
      :model-value="seo.description"
      name="seo_description"
      :rows="2"
      @update:model-value="emit('update:seo', { ...seo, description: $event })"
    /></label>
    <label>Canonical URL<UiInput
      :model-value="seo.canonical_url"
      name="canonical_url"
      placeholder="https://example.com/home"
      @update:model-value="emit('update:seo', { ...seo, canonical_url: $event })"
    /></label>
    <label>Robots<UiInput
      :model-value="seo.robots"
      name="robots"
      @update:model-value="emit('update:seo', { ...seo, robots: $event })"
    /></label>
  </fieldset>
  <fieldset class="metadata-grid">
    <legend>GEO / AEO</legend>
    <label>Region<UiInput
      :model-value="geo.region"
      name="geo_region"
      @update:model-value="emit('update:geo', { ...geo, region: $event })"
    /></label>
    <label>Locality<UiInput
      :model-value="geo.locality"
      name="geo_locality"
      @update:model-value="emit('update:geo', { ...geo, locality: $event })"
    /></label>
    <label>Question<UiInput
      :model-value="aeo.question"
      name="aeo_question"
      @update:model-value="emit('update:aeo', { ...aeo, question: $event })"
    /></label>
    <label>Answer<UiTextarea
      :model-value="aeo.answer"
      name="aeo_answer"
      :rows="3"
      @update:model-value="emit('update:aeo', { ...aeo, answer: $event })"
    /></label>
  </fieldset>
</template>

<style scoped>
.metadata-grid { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); min-width: 0; padding: 1rem; border: 1px solid #d5dbe5; border-radius: .8rem; }
legend { padding-inline: .35rem; color: #172033; font-weight: 750; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, textarea { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
textarea { resize: vertical; }
</style>
