<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import ContentForm from "@/modules/publishing/components/ContentForm.vue";
import type { PublishingContent } from "@/modules/publishing/api/content.client";
import type { ContentMutation } from "@/modules/publishing/schemas/content.schema";
import { createPublishingContentSubmitter } from "@/modules/publishing/mutations/content.mutations";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import { safeError } from "@/shared/api/errors";

const props = withDefaults(defineProps<{
  mode?: "create" | "edit";
  initial?: Partial<ContentMutation> | undefined;
  submit?: (input: ContentMutation) => Promise<PublishingContent>;
  loading?: boolean;
  forbidden?: boolean;
  error?: string;
  retry?: () => void;
}>(), { mode: "create", loading: false, forbidden: false });

const emit = defineEmits<{
  saved: [value: PublishingContent];
}>();

const dirty = ref(false);
const saving = ref(false);
const notice = ref("");
const errorMessage = ref("");
const submitter = props.submit === undefined ? undefined : createPublishingContentSubmitter(props.submit);

type UnloadEvent = { preventDefault: () => void; returnValue?: string };

function beforeUnload(event: UnloadEvent): void {
  if (!dirty.value || saving.value) return;
  event.preventDefault();
  event.returnValue = "";
}

onMounted(() => globalThis.addEventListener("beforeunload", beforeUnload));
onBeforeUnmount(() => globalThis.removeEventListener("beforeunload", beforeUnload));
onBeforeRouteLeave(() => {
  if (!dirty.value || saving.value) return true;
  return typeof globalThis.confirm !== "function" || globalThis.confirm("Discard unsaved content changes?");
});

async function save(input: ContentMutation): Promise<void> {
  if (submitter === undefined) {
    errorMessage.value = "Save action is not configured.";
    return;
  }
  saving.value = true;
  notice.value = "";
  errorMessage.value = "";
  try {
    const result = await submitter.submit(input);
    dirty.value = false;
    notice.value = "Content saved.";
    emit("saved", result);
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    saving.value = false;
  }
}

function markDirty(value: boolean): void {
  dirty.value = value;
  if (value) notice.value = "";
}
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="content-editor-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        PUBLISHING · AUTHORING
      </p>
      <h1 id="content-editor-title">
        {{ mode === "edit" ? "Edit content" : "Content editor" }}
      </h1>
      <p class="intro">
        Build localized page or post content from validated structured blocks.
      </p>
    </header>
    <ForbiddenState v-if="forbidden" />
    <div
      v-else-if="loading"
      class="panel state"
      role="status"
    >
      Loading editor…
    </div>
    <template v-else>
      <p
        v-if="error || errorMessage"
        class="error-message"
        role="alert"
      >
        {{ error || errorMessage }}
        <button
          v-if="retry"
          type="button"
          @click="retry()"
        >
          Try again
        </button>
      </p>
      <p
        v-if="notice"
        class="notice"
        role="status"
      >
        {{ notice }}
      </p>
      <p
        v-if="dirty"
        class="dirty"
        role="status"
      >
        Unsaved changes
      </p>
      <div class="panel">
        <ContentForm
          :initial="initial"
          :mode="mode"
          :disabled="saving"
          @dirty="markDirty"
          @submit="save"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.admin-page { width: min(70rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.panel { padding: clamp(.8rem, 3vw, 1.4rem); border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.notice, .error-message, .dirty { margin-bottom: 1rem; padding: .7rem .85rem; border-radius: .55rem; font-weight: 650; }
.notice { border: 1px solid #b8d9c1; color: #14532d; background: #f0fdf4; }
.error-message { border: 1px solid #f0b5bd; color: #881337; background: #fff1f2; }
.dirty { color: #92400e; background: #fffbeb; }
.error-message button { display: block; min-height: 2.75rem; margin-top: .6rem; padding: .5rem .8rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; cursor: pointer; font: inherit; font-weight: 750; }
</style>
