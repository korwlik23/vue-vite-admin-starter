<script setup lang="ts">
import type { Component } from "vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

export interface CMSRouteAdapter {
  initial: Record<string, unknown>;
  load?: () => Promise<Record<string, unknown>>;
}

export type CMSRouteAdapterFactory = (
  client: APIClient,
  route: ReturnType<typeof useRoute>,
) => CMSRouteAdapter;

const props = defineProps<{
  view: Component;
  client: APIClient;
  factory: CMSRouteAdapterFactory;
}>();

const route = useRoute();
const loading = ref(true);
const error = ref("");
const adapter = ref<CMSRouteAdapter>();
const values = ref<Record<string, unknown>>({});

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  const next = props.factory(props.client, route);
  adapter.value = next;
  values.value = { ...next.initial };
  if (!next.load) {
    loading.value = false;
    return;
  }
  try {
    values.value = { ...next.initial, ...(await next.load()) };
  } catch (cause) {
    error.value = safeError(cause).message;
  } finally {
    loading.value = false;
  }
}

onMounted(() => void load());
watch(() => route.fullPath, () => void load());

const viewProps = computed(() => ({
  ...values.value,
  loading: loading.value,
  error: error.value,
  retry: load,
}));
</script>

<template>
  <component
    :is="props.view"
    v-bind="viewProps"
  />
</template>
