<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { ref } from "vue";

import type { Asset } from "@/modules/media/api/assets.client";
import MediaDetails from "@/modules/media/components/MediaDetails.vue";
import MediaUploader, { type MediaUploadFile } from "@/modules/media/components/MediaUploader.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import { safeError } from "@/shared/api/errors";

const props = withDefaults(defineProps<{
  assets?: readonly Asset[];
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
  upload: (file: MediaUploadFile) => Promise<Asset>;
  remove: (asset: Asset) => Promise<void>;
}>(), { assets: () => [], loading: false, forbidden: false });

const localAssets = ref<Asset[]>([...props.assets]);
const busyID = ref("");
const localError = ref("");
const notice = ref("");

async function uploadFile(file: MediaUploadFile): Promise<Asset> {
  localError.value = "";
  const asset = await props.upload(file);
  localAssets.value = [asset, ...localAssets.value];
  notice.value = "Media uploaded and finalized.";
  return asset;
}

async function removeAsset(asset: Asset): Promise<void> {
  if (busyID.value) return;
  if (typeof globalThis.confirm === "function" && !globalThis.confirm(`Delete ${asset.original_name}?`)) return;
  busyID.value = asset.id;
  localError.value = "";
  notice.value = "";
  try {
    await props.remove(asset);
    localAssets.value = localAssets.value.filter((item) => item.id !== asset.id);
    notice.value = "Media asset deleted.";
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busyID.value = "";
  }
}
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="media-library-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        MEDIA · PRIVATE ASSETS
      </p>
      <h1 id="media-library-title">
        Media library
      </h1>
      <p class="intro">
        Upload and manage private media without exposing storage keys or raw upload details.
      </p>
    </header>
    <ForbiddenState v-if="forbidden" />
    <div
      v-else-if="loading"
      class="panel state"
      role="status"
    >
      Loading media assets…
    </div>
    <template v-else>
      <section
        v-if="error || localError"
        class="panel error-panel"
        role="alert"
      >
        <h2>Media library unavailable</h2>
        <p>{{ error || localError }}</p>
        <button
          v-if="retry"
          type="button"
          @click="retry()"
        >
          Try again
        </button>
      </section>
      <p
        v-if="notice"
        class="notice"
        role="status"
      >
        {{ notice }}
      </p>
      <MediaUploader
        :upload="uploadFile"
        :disabled="Boolean(busyID)"
      />
      <section
        v-if="localAssets.length === 0"
        class="panel state"
      >
        <h2>No media assets</h2>
        <p>Upload an image or PDF to use it in content.</p>
      </section>
      <div
        v-else
        class="asset-list"
        aria-label="Media assets"
      >
        <MediaDetails
          v-for="asset in localAssets"
          :key="asset.id"
          :asset="asset"
          :disabled="busyID === asset.id"
          @remove="removeAsset"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.admin-page { width: min(90rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.error-panel { border-color: #f0b5bd; color: #881337; background: #fff1f2; }
.notice { padding: .7rem .85rem; border: 1px solid #b8d9c1; border-radius: .55rem; color: #14532d; background: #f0fdf4; font-weight: 650; }
.error-panel button { min-height: 2.75rem; padding: .5rem .75rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; cursor: pointer; font: inherit; font-weight: 750; }
.asset-list { display: grid; gap: .7rem; margin-top: 1rem; }
</style>
