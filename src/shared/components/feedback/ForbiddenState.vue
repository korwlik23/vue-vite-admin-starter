<template>
  <section
    class="feedback-state"
    aria-labelledby="forbidden-title"
  >
    <p class="eyebrow">
      ACCESS LIMITED
    </p>
    <h1 id="forbidden-title">
      Permission required
    </h1>
    <p>
      Ask an administrator to grant the exact permission needed for this area.
    </p>
    <a href="/">Return to dashboard</a>
  </section>
</template>

<style scoped>
.feedback-state {
  max-width: 36rem;
  padding-block: 3rem;
}

a {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-top: 1rem;
  color: inherit;
  font-weight: 750;
}
</style>
