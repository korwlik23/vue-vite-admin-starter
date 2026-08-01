<script setup lang="ts">
import { onMounted, ref } from "vue";

import { listEnabledModules } from "@/modules/operations/api/modules.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

const props = defineProps<{ client: APIClient }>();
const modules = ref<Awaited<ReturnType<typeof listEnabledModules>>>([]);
const loading = ref(true);
const errorMessage = ref("");

onMounted(() => void loadModules());
async function loadModules(): Promise<void> { loading.value = true; errorMessage.value = ""; try { modules.value = await listEnabledModules(props.client); } catch (error) { errorMessage.value = safeError(error).message; } finally { loading.value = false; } }
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="modules-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        OPERATIONS · SYSTEM READ MODEL
      </p><h1 id="modules-title">
        Modules
      </h1><p class="intro">
        Enabled module health and reconciliation revisions.
      </p>
    </header><p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }} <button
        type="button"
        @click="loadModules"
      >
        Retry
      </button>
    </p><div
      v-if="loading"
      class="panel state"
      role="status"
    >
      Loading modules…
    </div><div
      v-else-if="modules.length === 0"
      class="panel state"
    >
      <h2>No module status</h2><p>The operations projection is unavailable or empty.</p>
    </div><div
      v-else
      class="panel"
    >
      <ul class="module-list">
        <li
          v-for="module in modules"
          :key="module.id"
        >
          <span>{{ module.id }}</span><span :class="{ healthy: module.enabled }">{{ module.enabled ? "Enabled" : "Disabled" }} · revision {{ module.reconcile_revision }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(90rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { color: #172033; font-size: 1.25rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.module-list { display: grid; gap: .7rem; padding: 0; margin: 0; list-style: none; }
li { display: flex; justify-content: space-between; gap: 1rem; padding: .75rem; border-bottom: 1px solid #e5e9f0; color: #172033; }
li span:last-child { color: #9f1239; font-size: .86rem; }
li span.healthy { color: #166534; }
.error-message { margin-bottom: 1rem; padding: .7rem .85rem; border: 1px solid #f0b5bd; border-radius: .55rem; color: #881337; background: #fff1f2; }
button { margin-left: .5rem; min-height: 2rem; padding: .25rem .55rem; border: 1px solid #aeb9c9; border-radius: .45rem; background: white; cursor: pointer; font: inherit; }
</style>
