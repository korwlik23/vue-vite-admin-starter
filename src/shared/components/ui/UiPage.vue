<template>
  <section class="ui-page">
    <slot />
  </section>
</template>

<style scoped>
.ui-page {
  display: grid;
  width: min(100%, var(--content-wide));
  margin-inline: auto;
  gap: var(--space-6);
}
</style>
