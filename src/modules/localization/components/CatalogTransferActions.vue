<script setup lang="ts">
import { UiButton, UiFileInput } from "@/shared/components/ui";

const props = defineProps<{
  transferring: "export" | "import" | "";
  disabled: boolean;
}>();
const emit = defineEmits<{ export: []; import: [file: globalThis.File] }>();

function selectFile(event: globalThis.Event): void {
  const input = event.target as globalThis.HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (file) emit("import", file);
}
</script>

<template>
  <div class="transfer-actions">
    <UiButton
      type="button"
      variant="secondary"
      :loading="props.transferring === 'export'"
      loading-label="Exporting…"
      :disabled="props.disabled || Boolean(props.transferring)"
      @click="emit('export')"
    >
      Export JSON
    </UiButton>
    <label class="file-action">
      <span>{{ props.transferring === "import" ? "Importing…" : "Import JSON" }}</span>
      <UiFileInput
        accept="application/json,.json"
        :disabled="props.disabled || Boolean(props.transferring)"
        @change="selectFile"
      />
    </label>
  </div>
</template>

<style scoped>
.transfer-actions { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.file-action { display: inline-grid; gap: var(--space-1); color: var(--color-text-muted); font-size: var(--text-sm); }
</style>
