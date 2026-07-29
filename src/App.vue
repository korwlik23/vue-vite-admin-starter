<script setup lang="ts">
import { Languages, LockKeyhole, PanelsTopLeft } from "@lucide/vue";

const foundations = [
  {
    title: "Permission-driven",
    detail: "Navigation and actions resolve exact permissions without fixed role names.",
    icon: LockKeyhole,
  },
  {
    title: "Dynamic languages",
    detail: "Users can select all eligible languages or an explicit subset.",
    icon: Languages,
  },
  {
    title: "Modular back office",
    detail: "Domain modules register routes only when enabled by the API.",
    icon: PanelsTopLeft,
  },
];
</script>

<template>
  <a
    class="skip-link"
    href="#main-content"
  >
    Skip to content
  </a>
  <div class="app-frame">
    <header class="topbar">
      <div>
        <p class="eyebrow">
          TEWARACH · STARTER
        </p>
        <h1>Admin foundation</h1>
      </div>
      <span class="status">
        <span aria-hidden="true" />
        Foundation ready
      </span>
    </header>
    <main
      id="main-content"
      class="content"
      tabindex="-1"
    >
      <section
        class="hero"
        aria-labelledby="hero-title"
      >
        <p class="eyebrow">
          CMS · BACK OFFICE · SAAS READY
        </p>
        <h2 id="hero-title">
          A calm control plane for systems that need to grow.
        </h2>
        <p>
          Vue, Vite, runtime configuration, permission-based access, and editable
          multilingual catalogs share one explicit architecture.
        </p>
      </section>
      <section
        class="foundation-grid"
        aria-label="Foundation capabilities"
      >
        <article
          v-for="item in foundations"
          :key="item.title"
          class="foundation-card"
        >
          <component
            :is="item.icon"
            :size="22"
            aria-hidden="true"
          />
          <h3>{{ item.title }}</h3>
          <p>{{ item.detail }}</p>
        </article>
      </section>
    </main>
  </div>
</template>
