<script setup lang="ts">
import type { Asset } from "@/modules/media/api/assets.client";

defineProps<{
  asset: Asset;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  remove: [value: Asset];
}>();
</script>

<template>
  <article class="asset-card">
    <div
      class="asset-preview"
      aria-hidden="true"
    >
      {{ asset.mime_type.split("/")[0]?.toUpperCase() || "FILE" }}
    </div>
    <div class="asset-copy">
      <h2>{{ asset.original_name }}</h2>
      <p>{{ asset.mime_type }} · {{ asset.byte_size.toLocaleString() }} bytes</p>
      <p v-if="asset.width && asset.height">
        {{ asset.width }} × {{ asset.height }}
      </p>
      <p class="version">
        Version {{ asset.version }}
      </p>
    </div>
    <button
      type="button"
      :aria-label="`Delete asset ${asset.original_name}`"
      :disabled="disabled"
      @click="emit('remove', asset)"
    >
      Delete
    </button>
  </article>
</template>

<style scoped>
.asset-card { display: grid; gap: .75rem; grid-template-columns: 4rem minmax(0, 1fr) auto; align-items: center; padding: .8rem; border: 1px solid #d5dbe5; border-radius: .8rem; }
.asset-preview { display: grid; min-height: 4rem; place-items: center; border-radius: .55rem; color: #1d4ed8; background: #dbeafe; font-size: .7rem; font-weight: 800; }
.asset-copy { min-width: 0; }
h2, p { margin-top: 0; }
h2 { margin-bottom: .25rem; color: #172033; font-size: 1rem; overflow-wrap: anywhere; }
p { margin-bottom: .2rem; color: #526078; font-size: .8rem; overflow-wrap: anywhere; }
.version { color: #667085; }
button { min-height: 2.75rem; padding: .5rem .75rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: #172033; background: white; cursor: pointer; font: inherit; font-weight: 750; }
button:disabled { cursor: wait; opacity: .55; }
@media (max-width: 34rem) { .asset-card { grid-template-columns: 3.5rem minmax(0, 1fr); } .asset-card button { grid-column: 1 / -1; justify-self: start; } }
</style>
