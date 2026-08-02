<script setup lang="ts">
import { ref } from "vue";

import type { Asset } from "@/modules/media/api/assets.client";
import { safeError } from "@/shared/api/errors";

export interface MediaUploadFile {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface FileInputLike {
  click(): void;
  value: string;
  files: readonly MediaUploadFile[] | null;
}

const props = defineProps<{
  upload: (file: MediaUploadFile) => Promise<Asset>;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  uploaded: [value: Asset];
}>();

const input = ref<FileInputLike>();
const pending = ref(false);
const errorMessage = ref("");

function chooseFile(): void {
  input.value?.click();
}

async function handleFile(event: { target: unknown }): Promise<void> {
  const target = event.target as FileInputLike | null;
  if (!target) return;
  const file = target.files?.[0];
  target.value = "";
  if (!file || pending.value) return;
  pending.value = true;
  errorMessage.value = "";
  try {
    emit("uploaded", await props.upload(file));
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section
    class="uploader"
    aria-labelledby="media-upload-title"
  >
    <div>
      <h2 id="media-upload-title">
        Upload media
      </h2>
      <p>Images and PDFs are checked for type, size, checksum, and private storage before finalization.</p>
    </div>
    <input
      ref="input"
      class="sr-only"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
      :disabled="disabled || pending"
      @change="handleFile"
    >
    <button
      type="button"
      :disabled="disabled || pending"
      @click="chooseFile"
    >
      {{ pending ? "Uploading…" : "Choose file" }}
    </button>
    <p
      v-if="pending"
      class="progress"
      role="status"
      aria-live="polite"
    >
      Upload in progress…
    </p>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </section>
</template>

<style scoped>
.uploader { display: grid; gap: .7rem; padding: 1rem; border: 1px dashed #94a3b8; border-radius: .8rem; background: rgb(248 250 252 / 75%); }
h2, p { margin-top: 0; }
h2 { margin-bottom: .35rem; color: #172033; font-size: 1.1rem; }
p { margin-bottom: 0; color: #526078; font-size: .84rem; line-height: 1.5; }
button { width: fit-content; min-height: 2.75rem; padding: .55rem .85rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: #172033; background: white; cursor: pointer; font: inherit; font-weight: 750; }
button:disabled { cursor: wait; opacity: .55; }
.progress { color: #1d4ed8; font-weight: 700; }
.error-message { color: #9f1239; font-weight: 650; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
