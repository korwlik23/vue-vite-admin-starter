<script setup lang="ts">
/* eslint-disable vue/require-default-prop */
import type { PublishingContent } from "@/modules/publishing/api/content.client";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";

const props = withDefaults(defineProps<{
  items?: readonly PublishingContent[];
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
  retry?: () => void;
}>(), { items: () => [], loading: false, forbidden: false });

const emit = defineEmits<{
  select: [value: PublishingContent];
}>();
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="content-list-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        PUBLISHING · CONTENT
      </p>
      <h1 id="content-list-title">
        Content library
      </h1>
      <p class="intro">
        Manage localized pages and posts with explicit versions and publication states.
      </p>
    </header>
    <ForbiddenState v-if="forbidden" />
    <div
      v-else-if="loading"
      class="panel state"
      role="status"
      aria-live="polite"
    >
      Loading content…
    </div>
    <section
      v-else-if="error"
      class="panel state error-panel"
      role="alert"
    >
      <h2>We could not load content</h2>
      <p>{{ error }}</p>
      <button
        v-if="retry"
        type="button"
        @click="retry()"
      >
        Try again
      </button>
    </section>
    <section
      v-else-if="props.items.length === 0"
      class="panel state"
      aria-live="polite"
    >
      <h2>No content yet</h2>
      <p>Create a page or post to start building the public site.</p>
    </section>
    <div
      v-else
      class="panel table-wrap"
    >
      <table>
        <caption class="sr-only">
          Publishing content
        </caption>
        <thead>
          <tr>
            <th scope="col">
              Title
            </th><th scope="col">
              Type
            </th><th scope="col">
              Locale
            </th><th scope="col">
              Version
            </th><th scope="col">
              Status
            </th><th scope="col">
              <span class="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in props.items"
            :key="item.content_id"
          >
            <th scope="row">
              <span class="title">{{ item.title }}</span><small>{{ item.path }}</small>
            </th>
            <td>{{ item.kind }}</td>
            <td>{{ item.locale_id }}</td>
            <td>{{ item.content_version }} / {{ item.translation_version }}</td>
            <td><span class="status">{{ item.content_status }}</span></td>
            <td>
              <button
                type="button"
                @click="emit('select', item)"
              >
                Open
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(92rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.error-panel { border-color: #f0b5bd; background: #fff1f2; }
button { min-height: 2.75rem; padding: .5rem .8rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: #172033; background: white; cursor: pointer; font: inherit; font-weight: 750; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 42rem; border-collapse: collapse; }
th, td { padding: .75rem .6rem; border-bottom: 1px solid #e5e9f0; text-align: left; vertical-align: top; }
th { color: #526078; font-size: .76rem; }
.title, small { display: block; }
.title { color: #172033; font-weight: 750; }
small { margin-top: .2rem; color: #667085; overflow-wrap: anywhere; font-weight: 400; }
.status { color: #526078; font-weight: 750; text-transform: capitalize; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
