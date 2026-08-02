import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import MenuEditorView from "@/modules/navigation/views/MenuEditorView.vue";
import type { Menu } from "@/modules/navigation/api/menus.client";

const menu: Menu = {
  id: "menu-1",
  account_id: "account-1",
  locale_id: "locale-1",
  key: "primary",
  name: "Primary",
  enabled: true,
  version: 3,
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  items: [
    {
      id: "item-1",
      label: "Home",
      target_kind: "internal_path",
      target: "/",
      position: 0,
      enabled: true,
      version: 1,
      children: [{
        id: "item-2",
        label: "Docs",
        target_kind: "internal_path",
        target: "/docs",
        position: 0,
        enabled: true,
        version: 1,
      }],
    },
  ],
};

describe("D4 MenuEditor", () => {
  it("renders nested menu items and saves with the current version", async () => {
    const save = vi.fn().mockResolvedValue({ ...menu, version: 4 });
    const reorder = vi.fn().mockResolvedValue({ ...menu, version: 4 });
    const wrapper = mount(MenuEditorView, { props: { menu, save, reorder } });

    expect(wrapper.text()).toContain("Home");
    expect(wrapper.text()).toContain("Docs");
    await wrapper.get('button[aria-label="Save menu Primary"]').trigger("click");

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ expected_version: 3 }));
  });

  it("keeps menu targets visible for keyboard editing", () => {
    const wrapper = mount(MenuEditorView, { props: { menu, save: vi.fn(), reorder: vi.fn() } });
    expect(wrapper.get('input[aria-label="Target Home"]').attributes("value")).toBe("/");
  });
});
