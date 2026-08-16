<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  title?: string;
  variant?: "info" | "success" | "warning" | "danger";
}>(), { title: "", variant: "info" });

const role = computed(() => props.variant === "danger" ? "alert" : "status");
</script>

<template>
  <div
    :class="['ui-alert', `ui-alert--${props.variant}`]"
    :role="role"
  >
    <strong v-if="props.title">{{ props.title }}</strong>
    <div class="ui-alert__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ui-alert {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-info);
  border-radius: var(--radius-md);
  color: var(--color-info);
  background: var(--color-info-soft);
}
.ui-alert--success { border-color: var(--color-success); color: var(--color-success); background: var(--color-success-soft); }
.ui-alert--warning { border-color: var(--color-warning); color: var(--color-warning); background: var(--color-warning-soft); }
.ui-alert--danger { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-danger-soft); }
.ui-alert__body { color: var(--color-text); line-height: var(--line-normal); }
</style>
