<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import { reactive, ref } from "vue";

import type { PublishingSchedule, ScheduleRequest } from "@/modules/publishing/api/schedules.client";
import ScheduleForm, { type ScheduleDraft } from "@/modules/publishing/components/ScheduleForm.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import { safeError } from "@/shared/api/errors";

const props = withDefaults(defineProps<{
  schedules?: readonly PublishingSchedule[];
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
  createSchedule: (input: ScheduleRequest) => Promise<PublishingSchedule>;
  cancelSchedule: (scheduleID: string) => Promise<void>;
}>(), { schedules: () => [], loading: false, forbidden: false });

const form = reactive<ScheduleDraft>({
  translation_id: "",
  publish_at: "",
  unpublish_at: "",
  expected_version: 1,
  idempotency_key: "",
});
const busyID = ref("");
const saving = ref(false);
const localError = ref("");
const notice = ref("");

async function create(): Promise<void> {
  if (saving.value) return;
  localError.value = "";
  notice.value = "";
  if (!form.translation_id.trim() || !form.publish_at || form.expected_version < 1) {
    localError.value = "Translation, publish time, and expected version are required.";
    return;
  }
  saving.value = true;
  const idempotencyKey = form.idempotency_key.trim() || `schedule-${Date.now()}`;
  try {
    const input: ScheduleRequest = {
      translation_id: form.translation_id.trim(),
      publish_at: new Date(form.publish_at).toISOString(),
      expected_version: form.expected_version,
      idempotency_key: idempotencyKey,
      ...(form.unpublish_at ? { unpublish_at: new Date(form.unpublish_at).toISOString() } : {}),
    };
    await props.createSchedule(input);
    form.idempotency_key = idempotencyKey;
    notice.value = "Publication schedule created.";
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    saving.value = false;
  }
}

async function cancel(schedule: PublishingSchedule): Promise<void> {
  if (busyID.value) return;
  if (typeof globalThis.confirm === "function" && !globalThis.confirm("Cancel this publication schedule?")) return;
  busyID.value = schedule.id;
  localError.value = "";
  notice.value = "";
  try {
    await props.cancelSchedule(schedule.id);
    notice.value = "Publication schedule canceled.";
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
    aria-labelledby="schedule-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        PUBLISHING · SCHEDULES
      </p>
      <h1 id="schedule-title">
        Publication schedules
      </h1>
      <p class="intro">
        Queue publish and unpublish operations with an idempotency key and optimistic version.
      </p>
    </header>
    <ForbiddenState v-if="forbidden" />
    <div
      v-else-if="loading"
      class="panel state"
      role="status"
    >
      Loading schedules…
    </div>
    <template v-else>
      <section
        v-if="error || localError"
        class="panel error-panel"
        role="alert"
      >
        <h2>Schedules unavailable</h2>
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
      <ScheduleForm
        :model-value="form"
        :disabled="saving"
        @update:model-value="Object.assign(form, $event)"
        @submit="create"
      />
      <section
        v-if="props.schedules.length === 0"
        class="panel state"
      >
        <h2>No schedules</h2>
        <p>Scheduled publication operations will appear here.</p>
      </section>
      <div
        v-else
        class="panel table-wrap"
      >
        <table>
          <caption class="sr-only">
            Publication schedules
          </caption>
          <thead>
            <tr>
              <th scope="col">
                Publish
              </th><th scope="col">
                Translation
              </th><th scope="col">
                State
              </th><th scope="col">
                Version
              </th><th scope="col">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="schedule in props.schedules"
              :key="schedule.id"
            >
              <td><time :datetime="schedule.publish_at">{{ schedule.publish_at }}</time></td>
              <td>{{ schedule.translation_id }}</td>
              <td>{{ schedule.state }}</td>
              <td>{{ schedule.expected_version }}</td>
              <td>
                <button
                  type="button"
                  :disabled="busyID === schedule.id || schedule.state !== 'pending'"
                  @click="cancel(schedule)"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.admin-page { width: min(92rem, 100%); margin-inline: auto; }
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
button { min-height: 2.75rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .55; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 42rem; border-collapse: collapse; }
th, td { padding: .7rem .55rem; border-bottom: 1px solid #e5e9f0; text-align: left; vertical-align: top; }
th { color: #526078; font-size: .76rem; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
