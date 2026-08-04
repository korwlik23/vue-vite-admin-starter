<script setup lang="ts">
type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger";
withDefaults(defineProps<{ variant?: BadgeVariant }>(), { variant: "neutral" });
</script>

<template>
  <span :class="['ui-badge', `ui-badge--${variant}`]"><slot /></span>
</template>

<style scoped>
.ui-badge { display: inline-flex; align-items: center; min-height: 1.75rem; border-radius: 999px; padding: 0.25rem 0.65rem; font-size: 0.78rem; font-weight: 750; }
.ui-badge--neutral { color: #344054; background: #eaecf0; }
.ui-badge--info { color: #175cd3; background: #dbeafe; }
.ui-badge--success { color: #027a48; background: #d1fadf; }
.ui-badge--warning { color: #b54708; background: #fef0c7; }
.ui-badge--danger { color: #b42318; background: #fee4e2; }
</style>
