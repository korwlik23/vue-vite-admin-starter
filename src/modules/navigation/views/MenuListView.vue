<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import type { Menu } from "@/modules/navigation/api/menus.client";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";

const props = withDefaults(defineProps<{
  menus?: readonly Menu[];
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
}>(), { menus: () => [], loading: false, forbidden: false });

const emit = defineEmits<{ select: [value: Menu] }>();
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="menu-list-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        NAVIGATION · MENUS
      </p>
      <h1 id="menu-list-title">
        Menu library
      </h1>
      <p class="intro">
        Build locale-aware menu trees with validated targets and optimistic versions.
      </p>
    </header>
    <ForbiddenState v-if="forbidden" />
    <div
      v-else-if="loading"
      class="panel state"
      role="status"
    >
      Loading menus…
    </div>
    <section
      v-else-if="error"
      class="panel state error-panel"
      role="alert"
    >
      <h2>Menus unavailable</h2><p>{{ error }}</p><button
        v-if="retry"
        type="button"
        @click="retry()"
      >
        Try again
      </button>
    </section>
    <section
      v-else-if="props.menus.length === 0"
      class="panel state"
    >
      <h2>No menus</h2><p>Create a menu to start navigation.</p>
    </section>
    <div
      v-else
      class="menu-list"
    >
      <article
        v-for="menu in props.menus"
        :key="menu.id"
        class="panel menu-card"
      >
        <div>
          <p class="eyebrow">
            {{ menu.key }} · {{ menu.locale_id }}
          </p><h2>{{ menu.name }}</h2><p>Version {{ menu.version }} · {{ menu.items.length }} top-level items</p>
        </div>
        <button
          type="button"
          @click="emit('select', menu)"
        >
          Edit menu
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(80rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { margin-bottom: .3rem; color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro, .menu-card p:not(.eyebrow) { color: #526078; line-height: 1.5; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.error-panel { border-color: #f0b5bd; color: #881337; background: #fff1f2; }
button { min-height: 2.75rem; padding: .5rem .75rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: #172033; background: white; cursor: pointer; font: inherit; font-weight: 750; }
.menu-list { display: grid; gap: .7rem; }
.menu-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
@media (max-width: 38rem) { .menu-card { align-items: stretch; flex-direction: column; } }
</style>
