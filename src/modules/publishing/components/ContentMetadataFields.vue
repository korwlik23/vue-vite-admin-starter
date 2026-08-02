<script setup lang="ts">
import type { ContentMutation } from "@/modules/publishing/schemas/content.schema";

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
    <label>SEO title<input
      :value="seo.title"
      name="seo_title"
      @input="emit('update:seo', { ...seo, title: ($event.target as HTMLInputElement).value })"
    ></label>
    <label>SEO description<textarea
      :value="seo.description"
      name="seo_description"
      rows="2"
      @input="emit('update:seo', { ...seo, description: ($event.target as HTMLTextAreaElement).value })"
    /></label>
    <label>Canonical URL<input
      :value="seo.canonical_url"
      name="canonical_url"
      placeholder="https://example.com/home"
      @input="emit('update:seo', { ...seo, canonical_url: ($event.target as HTMLInputElement).value })"
    ></label>
    <label>Robots<input
      :value="seo.robots"
      name="robots"
      @input="emit('update:seo', { ...seo, robots: ($event.target as HTMLInputElement).value })"
    ></label>
  </fieldset>
  <fieldset class="metadata-grid">
    <legend>GEO / AEO</legend>
    <label>Region<input
      :value="geo.region"
      name="geo_region"
      @input="emit('update:geo', { ...geo, region: ($event.target as HTMLInputElement).value })"
    ></label>
    <label>Locality<input
      :value="geo.locality"
      name="geo_locality"
      @input="emit('update:geo', { ...geo, locality: ($event.target as HTMLInputElement).value })"
    ></label>
    <label>Question<input
      :value="aeo.question"
      name="aeo_question"
      @input="emit('update:aeo', { ...aeo, question: ($event.target as HTMLInputElement).value })"
    ></label>
    <label>Answer<textarea
      :value="aeo.answer"
      name="aeo_answer"
      rows="3"
      @input="emit('update:aeo', { ...aeo, answer: ($event.target as HTMLTextAreaElement).value })"
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
