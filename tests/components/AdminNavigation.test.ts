import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";

import AdminShell from "@/app/layouts/AdminShell.vue";
import LocaleSwitcher from "@/shared/components/shell/LocaleSwitcher.vue";
import Sidebar from "@/shared/components/shell/Sidebar.vue";

describe("U13B", () => {
  it("exposes mobile disclosure state and closes it with Escape", async () => {
    const wrapper = mount(AdminShell);
    const toggle = wrapper.get('button[aria-controls="admin-navigation"]');

    expect(toggle.attributes("aria-expanded")).toBe("false");
    await toggle.trigger("click");
    expect(toggle.attributes("aria-expanded")).toBe("true");
    await wrapper.get(".admin-shell").trigger("keydown", { key: "Escape" });
    expect(toggle.attributes("aria-expanded")).toBe("false");
  });

  it("switches among the eligible locale options", async () => {
    const wrapper = mount(LocaleSwitcher, {
      props: {
        modelValue: "en",
        locales: [
          { code: "en", name: "English" },
          { code: "th", name: "ไทย" },
        ],
      },
    });

    await wrapper.get("select").setValue("th");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["th"]);
  });

  it("uses exact SPA navigation so Foundation is not current on nested routes", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: {} },
        { path: "/authorization/roles", component: {} },
      ],
    });
    await router.push("/authorization/roles");
    await router.isReady();
    const wrapper = mount(Sidebar, {
      props: { items: [
        { id: "foundation", label: "Foundation", href: "/" },
        { id: "roles", label: "Roles", href: "/authorization/roles" },
      ] },
      global: { plugins: [router] },
    });
    expect(wrapper.get('a[href="/"]').attributes("aria-current")).toBeUndefined();
    expect(wrapper.get('a[href="/authorization/roles"]').attributes("aria-current")).toBe("page");
    await wrapper.get('a[href="/"]').trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/");
  });
});
