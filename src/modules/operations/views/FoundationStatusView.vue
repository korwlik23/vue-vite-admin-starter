<script setup lang="ts">
import ErrorState from "@/shared/components/feedback/ErrorState.vue";
import LoadingState from "@/shared/components/feedback/LoadingState.vue";

withDefaults(
  defineProps<{
    state: "loading" | "error" | "success";
    account?: { name: string; slug: string } | undefined;
    selectedLocale?: string;
    enabledModules?: string[];
    retry: () => void;
  }>(),
  {
    account: undefined,
    selectedLocale: "",
    enabledModules: () => [],
  },
);
</script>

<template>
  <LoadingState
    v-if="state === 'loading'"
    label="Loading foundation status"
  />
  <ErrorState
    v-else-if="state === 'error'"
    :retry="retry"
  />
  <section
    v-else
    aria-labelledby="foundation-title"
  >
    <p class="eyebrow">
      SYSTEM OVERVIEW
    </p>
    <h1 id="foundation-title">
      Foundation status
    </h1>
    <div class="status-grid">
      <article>
        <p>Current account</p>
        <h2>{{ account?.name || "Unavailable" }}</h2>
        <span>{{ account?.slug || "—" }}</span>
      </article>
      <article>
        <p>Selected language</p>
        <h2>{{ selectedLocale || "System default" }}</h2>
        <span>Admin URLs remain language-neutral</span>
      </article>
      <article>
        <p>Enabled modules</p>
        <h2>{{ enabledModules.length }}</h2>
        <ul>
          <li
            v-for="moduleID in enabledModules"
            :key="moduleID"
          >
            {{ moduleID }}
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
h1 {
  margin: 0.6rem 0 2rem;
  font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: -0.045em;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

article {
  min-width: 0;
  padding: 1.2rem;
  border: 1px solid #d5dbe5;
  border-radius: 1rem;
  background: rgb(255 255 255 / 75%);
}

article p,
article h2,
ul {
  margin-top: 0;
}

article p,
article span,
li {
  color: #667085;
}

ul {
  padding-left: 1.2rem;
}

@media (max-width: 48rem) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
