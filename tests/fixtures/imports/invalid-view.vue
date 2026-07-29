<script setup lang="ts">
import type { components } from "../../../src/generated/api/schema";

defineProps<{ session: components["schemas"]["CurrentSessionResponse"] }>();
</script>

<template>
  <p>{{ session.session_id }}</p>
</template>
