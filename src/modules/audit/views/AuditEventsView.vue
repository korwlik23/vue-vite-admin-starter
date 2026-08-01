<script setup lang="ts">
import { onMounted, ref } from "vue";

import { listAuditEvents, type AuditEvent } from "@/modules/audit/api/events.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

const props = defineProps<{ client: APIClient }>();
const events = ref<AuditEvent[]>([]);
const nextCursor = ref<string>();
const cursor = ref("");
const action = ref("");
const actorID = ref("");
const loading = ref(true);
const errorMessage = ref("");

onMounted(() => void loadEvents());

async function loadEvents(reset = true): Promise<void> {
  loading.value = true; errorMessage.value = "";
  if (reset) cursor.value = "";
  try {
    const input: Parameters<typeof listAuditEvents>[1] = { limit: 50 };
    if (cursor.value) input.cursor = cursor.value;
    if (action.value.trim()) input.action = action.value.trim();
    if (actorID.value.trim()) input.actorID = actorID.value.trim();
    const result = await listAuditEvents(props.client, input);
    events.value = reset ? result.items : [...events.value, ...result.items];
    nextCursor.value = result.next_cursor ?? undefined;
  } catch (error) { errorMessage.value = safeError(error).message; } finally { loading.value = false; }
}

function loadNext(): void { if (!nextCursor.value || loading.value) return; cursor.value = nextCursor.value; void loadEvents(false); }
function displayData(event: AuditEvent): string { return JSON.stringify(redact(event.data)); }
function redact(value: Record<string, unknown>): Record<string, unknown> { const output: Record<string, unknown> = {}; for (const [key, entry] of Object.entries(value)) { const normalized = key.toLowerCase(); if (["secret", "token", "password", "email", "phone", "cookie", "authorization"].some((item) => normalized.includes(item))) continue; if (isRecord(entry)) output[key] = redact(entry); else if (Array.isArray(entry)) output[key] = entry.map((item) => isRecord(item) ? redact(item) : item); else output[key] = entry; } return output; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="audit-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        AUDIT · SYSTEM READ MODEL
      </p><h1 id="audit-title">
        Audit events
      </h1><p class="intro">
        Append-only security history with sensitive payload keys removed at the API boundary.
      </p>
    </header>
    <form
      class="filters"
      @submit.prevent="loadEvents()"
    >
      <label>Action<input
        v-model="action"
        autocomplete="off"
        placeholder="authorization.role.updated"
      ></label><label>Actor ID<input
        v-model="actorID"
        autocomplete="off"
        placeholder="user UUID"
      ></label><button
        type="submit"
        :disabled="loading"
      >
        Refresh
      </button>
    </form>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <div
      v-if="loading && events.length === 0"
      class="panel state"
      role="status"
    >
      Loading audit events…
    </div>
    <div
      v-else-if="events.length === 0"
      class="panel state"
    >
      <h2>No events</h2><p>The selected filters returned no events.</p>
    </div>
    <div
      v-else
      class="panel table-wrap"
    >
      <table>
        <caption class="sr-only">
          Audit events
        </caption><thead>
          <tr>
            <th scope="col">
              Recorded
            </th><th scope="col">
              Action
            </th><th scope="col">
              Actor
            </th><th scope="col">
              Data
            </th>
          </tr>
        </thead><tbody>
          <tr
            v-for="event in events"
            :key="event.id"
          >
            <td><time :datetime="event.recorded_at">{{ event.recorded_at }}</time></td><td>{{ event.action }}</td><td>{{ event.actor_id ?? event.actor_type }}</td><td><code>{{ displayData(event) }}</code></td>
          </tr>
        </tbody>
      </table><button
        v-if="nextCursor"
        type="button"
        :disabled="loading"
        @click="loadNext"
      >
        Load more
      </button>
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
.filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin-bottom: 1rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, button { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .75rem .6rem; border-bottom: 1px solid #e5e9f0; text-align: left; vertical-align: top; }
th { color: #526078; font-size: .76rem; }
code { display: block; max-width: 32rem; overflow-wrap: anywhere; color: #526078; font-size: .78rem; white-space: pre-wrap; }
.error-message { margin-bottom: 1rem; padding: .7rem .85rem; border: 1px solid #f0b5bd; border-radius: .55rem; color: #881337; background: #fff1f2; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
