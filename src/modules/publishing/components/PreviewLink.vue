<script setup lang="ts">
defineProps<{
  href?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <a
    v-if="href && !disabled"
    class="preview-link"
    :href="href"
    target="_blank"
    rel="noopener nofollow"
  >
    Open preview
  </a>
  <span
    v-else
    class="preview-link disabled"
    aria-disabled="true"
  >
    Preview unavailable
  </span>
</template>

<style scoped>
.preview-link { display: inline-flex; min-height: 2.75rem; align-items: center; padding-inline: .8rem; border-radius: .55rem; color: #1d4ed8; font-weight: 750; }
.preview-link.disabled { color: #667085; }
</style>
