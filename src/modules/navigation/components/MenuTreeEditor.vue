<script setup lang="ts">
import type { MenuItemInput } from "@/modules/navigation/api/menus.client";

defineOptions({ name: "MenuTreeEditor" });

const props = withDefaults(defineProps<{
  modelValue: readonly MenuItemInput[];
  disabled?: boolean;
}>(), { disabled: false });

const emit = defineEmits<{
  "update:modelValue": [value: MenuItemInput[]];
}>();

function update(index: number, patch: Partial<MenuItemInput>): void {
  emit("update:modelValue", props.modelValue.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
}

function updateChildren(index: number, children: MenuItemInput[]): void {
  update(index, { children });
}
</script>

<template>
  <ol class="menu-tree">
    <li
      v-for="(item, index) in modelValue"
      :key="item.id || `${item.position}-${index}`"
      class="menu-item"
    >
      <div class="item-fields">
        <label :for="`menu-label-${item.id || index}`">Label <strong>{{ item.label }}</strong><input
          :id="`menu-label-${item.id || index}`"
          :value="item.label"
          :disabled="disabled"
          :aria-label="`Label ${item.label}`"
          @input="update(index, { label: ($event.target as HTMLInputElement).value })"
        ></label>
        <label :for="`menu-target-${item.id || index}`">Target<input
          :id="`menu-target-${item.id || index}`"
          :value="item.target"
          :disabled="disabled"
          :aria-label="`Target ${item.label}`"
          @input="update(index, { target: ($event.target as HTMLInputElement).value })"
        ></label>
        <label :for="`menu-kind-${item.id || index}`">Target type<select
          :id="`menu-kind-${item.id || index}`"
          :value="item.target_kind"
          :disabled="disabled"
          @change="update(index, { target_kind: ($event.target as HTMLSelectElement).value as MenuItemInput['target_kind'] })"
        ><option value="internal_path">Internal path</option><option value="external_url">External URL</option><option value="content_key">Content key</option></select></label>
        <label class="enabled"><input
          type="checkbox"
          :checked="item.enabled"
          :disabled="disabled"
          @change="update(index, { enabled: ($event.target as HTMLInputElement).checked })"
        >Enabled</label>
      </div>
      <MenuTreeEditor
        v-if="item.children && item.children.length > 0"
        :model-value="item.children"
        :disabled="disabled"
        @update:model-value="updateChildren(index, $event)"
      />
    </li>
  </ol>
</template>

<style scoped>
.menu-tree { display: grid; gap: .7rem; margin: 0; padding-left: 1rem; list-style: none; }
.menu-item { display: grid; gap: .7rem; padding: .8rem; border-left: 2px solid #bfdbfe; border-radius: .55rem; background: rgb(248 250 252 / 75%); }
.item-fields { display: grid; gap: .65rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); align-items: end; }
label { display: grid; gap: .3rem; color: #526078; font-size: .78rem; font-weight: 700; }
input, select { min-height: 2.6rem; padding: .45rem .6rem; border: 1px solid #aeb9c9; border-radius: .5rem; background: white; font: inherit; }
input[type="checkbox"] { min-height: 1.1rem; width: 1.1rem; }
.enabled { display: flex; min-height: 2.6rem; align-items: center; gap: .4rem; }
</style>
