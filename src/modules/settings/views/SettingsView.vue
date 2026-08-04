<!-- eslint-disable vue/max-attributes-per-line vue/singleline-html-element-content-newline vue/multiline-html-element-content-newline vue/html-indent vue/html-closing-bracket-newline vue/html-closing-bracket-spacing -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  listSettings,
  updateSetting,
  type Setting,
} from "@/modules/settings/api/settings.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";
import UiButton from "@/shared/components/ui/UiButton.vue";
import UiInput from "@/shared/components/ui/UiInput.vue";

const props = defineProps<{ client: APIClient }>();
const items = ref<Setting[]>([]);
const loading = ref(true);
const saving = ref("");
const errorMessage = ref("");
const notice = ref("");
onMounted(() => void load());
async function load(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";
  try {
    items.value = await listSettings(props.client);
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    loading.value = false;
  }
}
async function save(item: Setting): Promise<void> {
  saving.value = item.key;
  errorMessage.value = "";
  notice.value = "";
  try {
    const result = await updateSetting(
      props.client,
      item.key,
      item.value,
      item.version,
    );
    items.value = items.value.map((current) =>
      current.key === result.key ? result : current,
    );
    notice.value = `Saved ${item.key}`;
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    saving.value = "";
  }
}
</script>
<template>
  <section
    class="admin-page"
    aria-labelledby="settings-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        SYSTEM · GLOBAL SETTINGS
      </p>
      <h1 id="settings-title">
        Settings
      </h1>
      <p class="intro">
        Edit non-secret global values. Secrets stay in environment
        configuration.
      </p>
    </header>
    <p
      v-if="notice"
      class="notice"
      role="status"
    >
      {{ notice }}
    </p>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
      <UiButton
        size="sm"
        variant="secondary"
        @click="load"
      >
        Retry
      </UiButton>
    </p>
    <div
      v-if="loading"
      class="panel state"
      role="status"
    >
      Loading settings…
    </div>
    <div
      v-else-if="items.length === 0"
      class="panel state"
    >
      No editable settings.
    </div>
    <div
      v-else
      class="panel list"
    >
      <label
        v-for="item in items"
        :key="item.key"
      ><span>{{ item.key }} · v{{ item.version }}</span><UiInput
        v-model="item.value"
        :aria-label="item.key"
      /><UiButton
        size="sm"
        :loading="saving === item.key"
        :disabled="saving !== ''"
        @click="save(item)"
      >Save</UiButton></label>
    </div>
  </section>
</template>
<style scoped>
.admin-page {
  width: min(70rem, 100%);
  margin: auto;
}
.page-header {
  margin-bottom: 1.4rem;
}
h1,
p {
  margin-top: 0;
}
h1 {
  color: #101828;
  font-size: clamp(2rem, 4vw, 3.4rem);
  letter-spacing: -0.045em;
}
.eyebrow {
  color: #526078;
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.14em;
}
.intro {
  color: #526078;
  line-height: 1.6;
}
.panel {
  padding: 1rem;
  border: 1px solid #d5dbe5;
  border-radius: 1rem;
  background: #fff;
}
.list {
  display: grid;
  gap: 0.8rem;
}
.list label {
  display: grid;
  grid-template-columns: minmax(12rem, 0.8fr) minmax(15rem, 2fr) auto;
  align-items: center;
  gap: 0.7rem;
  color: #344054;
}
.state {
  text-align: center;
  padding-block: 3rem;
}
.notice,
.error-message {
  padding: 0.7rem 0.85rem;
  border: 1px solid #b8d9c1;
  border-radius: 0.55rem;
  color: #14532d;
  background: #f0fdf4;
}
.error-message {
  border-color: #f0b5bd;
  color: #881337;
  background: #fff1f2;
}
</style>
