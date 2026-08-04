<!-- eslint-disable -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  enqueueOperationJob,
  listOperationJobs,
  retryOperationJob,
  type OperationJob,
} from "@/modules/operations/api/jobs.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";
import UiButton from "@/shared/components/ui/UiButton.vue";
import UiInput from "@/shared/components/ui/UiInput.vue";
const props = defineProps<{ client: APIClient }>();
const jobs = ref<OperationJob[]>([]);
const name = ref("media.cleanup");
const payload = ref("{}");
const loading = ref(true);
const busy = ref(false);
const errorMessage = ref("");
onMounted(() => void load());
async function load(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";
  try {
    jobs.value = await listOperationJobs(props.client);
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    loading.value = false;
  }
}
async function enqueue(): Promise<void> {
  busy.value = true;
  errorMessage.value = "";
  try {
    const result = await enqueueOperationJob(
      props.client,
      name.value.trim(),
      JSON.parse(payload.value) as Record<string, unknown>,
    );
    jobs.value = [result, ...jobs.value];
  } catch (error) {
    errorMessage.value =
      error instanceof SyntaxError
        ? "Payload must be valid JSON."
        : safeError(error).message;
  } finally {
    busy.value = false;
  }
}
async function retry(job: OperationJob): Promise<void> {
  busy.value = true;
  try {
    await retryOperationJob(props.client, job.id);
    job.state = "queued";
    job.last_error = null;
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <section
    class="admin-page"
    aria-labelledby="jobs-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        OPERATIONS · DURABLE JOBS
      </p>
      <h1 id="jobs-title">
        Jobs
      </h1>
      <p class="intro">
        Queue work durably, inspect failures, and retry without losing the audit
        trail.
      </p>
    </header>
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
    <form
      class="enqueue panel"
      @submit.prevent="enqueue"
    >
      <UiInput
        v-model="name"
        aria-label="Job name"
        placeholder="media.cleanup"
      /><UiInput
        v-model="payload"
        aria-label="Job payload"
      /><UiButton
        type="submit"
        :loading="busy"
      >
        Enqueue
      </UiButton>
    </form>
    <div
      v-if="loading"
      class="panel state"
    >
      Loading jobs…
    </div>
    <div
      v-else-if="jobs.length === 0"
      class="panel state"
    >
      No jobs.
    </div>
    <ul
      v-else
      class="panel list"
    >
      <li
        v-for="job in jobs"
        :key="job.id"
      >
        <div>
          <strong>{{ job.name }}</strong>
          <p>{{ job.state }} · attempts {{ job.attempts }}</p>
          <small v-if="job.last_error">{{ job.last_error }}</small>
        </div>
        <UiButton
          v-if="job.state === 'failed'"
          size="sm"
          variant="secondary"
          :disabled="busy"
          @click="retry(job)"
        >
          Retry
        </UiButton>
      </li>
    </ul>
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
.enqueue {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 0.7rem;
  margin-bottom: 1rem;
}
.state {
  text-align: center;
  padding-block: 3rem;
}
.list {
  display: grid;
  gap: 0.8rem;
  margin: 0;
  padding: 1rem;
  list-style: none;
}
.list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem;
  border-bottom: 1px solid #edf0f4;
}
.list p {
  margin: 0.35rem 0;
  color: #526078;
}
.list small {
  color: #881337;
}
.error-message {
  padding: 0.7rem 0.85rem;
  border: 1px solid #f0b5bd;
  border-radius: 0.55rem;
  color: #881337;
  background: #fff1f2;
}
</style>
