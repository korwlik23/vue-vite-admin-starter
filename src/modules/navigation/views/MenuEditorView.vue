<script setup lang="ts">
 
import { reactive, ref, watch } from "vue";

import type { Menu, MenuItem, MenuItemInput, MenuUpdateRequest } from "@/modules/navigation/api/menus.client";
import MenuTreeEditor from "@/modules/navigation/components/MenuTreeEditor.vue";
import { safeError } from "@/shared/api/errors";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";

const props = defineProps<{
  menu: Menu;
  save: (input: MenuUpdateRequest) => Promise<Menu>;
  remove?: (input: { id: string; expected_version: number }) => Promise<void>;
  loading?: boolean;
  error?: string;
  forbidden?: boolean;
}>();

const emit = defineEmits<{ saved: [value: Menu]; removed: [value: string] }>();

interface MenuDraft {
  key: string;
  name: string;
  locale_id: string;
  enabled: boolean;
  items: MenuItemInput[];
}

function toInput(items: readonly MenuItem[]): MenuItemInput[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    target: item.target,
    target_kind: item.target_kind,
    position: item.position,
    enabled: item.enabled,
    ...(item.parent_id ? { parent_id: item.parent_id } : {}),
    ...(item.children && item.children.length > 0 ? { children: toInput(item.children) } : {}),
  }));
}

function copyMenu(menu: Menu): MenuDraft {
  return { key: menu.key, name: menu.name, locale_id: menu.locale_id, enabled: menu.enabled, items: toInput(menu.items) };
}

const draft = reactive<MenuDraft>(copyMenu(props.menu));
const busy = ref(false);
const localError = ref("");
const notice = ref("");

watch(() => props.menu, (menu) => Object.assign(draft, copyMenu(menu)), { deep: true });

async function saveMenu(): Promise<void> {
  if (busy.value) return;
  busy.value = true;
  localError.value = "";
  notice.value = "";
  try {
    const saved = await props.save({ ...draft, expected_version: props.menu.version });
    notice.value = "Menu saved.";
    emit("saved", saved);
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busy.value = false;
  }
}

async function removeMenu(): Promise<void> {
  if (!props.remove || busy.value || !globalThis.confirm(`Delete menu ${props.menu.name}?`)) return;
  busy.value = true;
  localError.value = "";
  try {
    await props.remove({ id: props.menu.id, expected_version: props.menu.version });
    emit("removed", props.menu.id);
  } catch (error) {
    localError.value = safeError(error).message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="menu-editor-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        NAVIGATION · MENU EDITOR
      </p>
      <h1 id="menu-editor-title">
        Edit {{ props.menu.name }}
      </h1>
      <p class="intro">
        Changes use the server version so another editor cannot silently overwrite this menu.
      </p>
    </header>
    <ForbiddenState v-if="props.forbidden" />
    <div
      v-else-if="props.loading"
      class="panel state"
      role="status"
    >
      Loading menu…
    </div>
    <section
      v-else
      class="panel editor"
      aria-describedby="menu-editor-help"
    >
      <p
        id="menu-editor-help"
        class="helper"
      >
        Version {{ props.menu.version }} · {{ props.menu.locale_id }}
      </p>
      <div class="fields">
        <label>Key<input
          v-model.trim="draft.key"
          :disabled="busy"
          autocomplete="off"
        ></label>
        <label>Name<input
          v-model.trim="draft.name"
          :disabled="busy"
          autocomplete="off"
        ></label>
        <label>Locale ID<input
          v-model.trim="draft.locale_id"
          :disabled="busy"
          autocomplete="off"
        ></label>
        <label class="enabled"><input
          v-model="draft.enabled"
          type="checkbox"
          :disabled="busy"
        >Enabled</label>
      </div>
      <div class="tree-section">
        <div>
          <h2>Menu items</h2><p class="helper">
            Use nested items for dropdowns. Targets are validated by the API.
          </p>
        </div>
        <MenuTreeEditor
          v-model="draft.items"
          :disabled="busy"
        />
      </div>
      <p
        v-if="props.error || localError"
        class="error-panel"
        role="alert"
      >
        {{ props.error || localError }}
      </p>
      <p
        v-if="notice"
        class="notice"
        role="status"
      >
        {{ notice }}
      </p>
      <footer class="actions">
        <button
          type="button"
          :disabled="busy"
          :aria-label="`Save menu ${props.menu.name}`"
          @click="saveMenu"
        >
          {{ busy ? "Saving…" : "Save menu" }}
        </button>
        <button
          v-if="props.remove"
          type="button"
          class="danger"
          :disabled="busy"
          :aria-label="`Delete menu ${props.menu.name}`"
          @click="removeMenu"
        >
          Delete menu
        </button>
      </footer>
    </section>
  </section>
</template>

<style scoped>
.admin-page { width: min(80rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { margin-bottom: .35rem; color: #172033; font-size: 1.2rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro, .helper { color: #526078; line-height: 1.5; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.fields { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); align-items: end; }
label { display: grid; gap: .3rem; color: #526078; font-size: .78rem; font-weight: 700; }
input { min-height: 2.6rem; padding: .45rem .6rem; border: 1px solid #aeb9c9; border-radius: .5rem; background: white; font: inherit; }
input[type="checkbox"] { min-height: 1.1rem; width: 1.1rem; }
.enabled { display: flex; min-height: 2.6rem; align-items: center; gap: .4rem; }
.tree-section { display: grid; gap: .9rem; margin-top: 1.6rem; }
.error-panel, .notice { margin-block: 1rem 0; padding: .7rem .85rem; border-radius: .55rem; }
.error-panel { border: 1px solid #f0b5bd; color: #881337; background: #fff1f2; }
.notice { border: 1px solid #b8d9c1; color: #14532d; background: #f0fdf4; font-weight: 650; }
.actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.2rem; }
button { min-height: 2.75rem; padding: .5rem .8rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: white; background: #155eef; cursor: pointer; font: inherit; font-weight: 750; }
button:disabled { cursor: wait; opacity: .65; }
button.danger { color: #9f1239; background: white; border-color: #f0b5bd; }
</style>
