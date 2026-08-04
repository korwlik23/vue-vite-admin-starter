<!-- eslint-disable -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/modules/notifications/api/notifications.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";
import UiButton from "@/shared/components/ui/UiButton.vue";
const props = defineProps<{ client: APIClient }>();
const items = ref<Notification[]>([]);
const loading = ref(true);
const busy = ref(false);
const errorMessage = ref("");
onMounted(() => void load());
async function load(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";
  try {
    items.value = await listNotifications(props.client);
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    loading.value = false;
  }
}
async function read(item: Notification): Promise<void> {
  busy.value = true;
  try {
    await markNotificationRead(props.client, item.id);
    item.read_at = new Date().toISOString();
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    busy.value = false;
  }
}
async function readAll(): Promise<void> {
  busy.value = true;
  try {
    await markAllNotificationsRead(props.client);
    const now = new Date().toISOString();
    items.value.forEach((item) => {
      item.read_at = now;
    });
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
    aria-labelledby="notifications-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        IDENTITY · IN-APP INBOX
      </p>
      <h1 id="notifications-title">
        Notifications
      </h1>
      <p class="intro">
        Private notifications are scoped to the authenticated user.
      </p>
      <UiButton
        variant="secondary"
        :loading="busy"
        @click="readAll"
      >
        Mark all read
      </UiButton>
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
    <div
      v-if="loading"
      class="panel state"
    >
      Loading notifications…
    </div>
    <div
      v-else-if="items.length === 0"
      class="panel state"
    >
      No notifications.
    </div>
    <ul
      v-else
      class="panel list"
    >
      <li
        v-for="item in items"
        :key="item.id"
        :class="{ read: item.read_at }"
      >
        <div>
          <strong>{{ item.title }}</strong>
          <p>{{ item.body }}</p>
          <small>{{ new Date(item.created_at).toLocaleString() }} ·
            {{ item.kind }}</small>
        </div>
        <UiButton
          v-if="!item.read_at"
          size="sm"
          variant="secondary"
          :disabled="busy"
          @click="read(item)"
        >
          Read
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
.list li.read {
  opacity: 0.6;
}
.list p {
  margin: 0.35rem 0;
  color: #526078;
}
.list small {
  color: #667085;
}
.error-message {
  padding: 0.7rem 0.85rem;
  border: 1px solid #f0b5bd;
  border-radius: 0.55rem;
  color: #881337;
  background: #fff1f2;
}
</style>
