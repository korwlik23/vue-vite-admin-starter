<script setup lang="ts">
type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger";
withDefaults(defineProps<{ variant?: BadgeVariant }>(), { variant: "neutral" });
</script>

<template>
  <span :class="['ui-badge', `ui-badge--${variant}`]"><slot /></span>
</template>

<style scoped>
.ui-badge { display: inline-flex; align-items: center; min-height: 1.75rem; border-radius: var(--radius-pill); padding: var(--space-1) 0.65rem; font-size: 0.78rem; font-weight: 750; }
.ui-badge--neutral { color: var(--color-text-muted); background: var(--color-surface-strong); }
.ui-badge--info { color: var(--color-info); background: var(--color-info-soft); }
.ui-badge--success { color: var(--color-success); background: var(--color-success-soft); }
.ui-badge--warning { color: var(--color-warning); background: var(--color-warning-soft); }
.ui-badge--danger { color: var(--color-danger); background: var(--color-danger-soft); }
</style>
