import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";

import AdminRouteShell from "@/app/layouts/AdminRouteShell.vue";

describe("admin route shell", () => {
  it("renders only the permission-filtered navigation supplied by bootstrap", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/:pathMatch(.*)*", component: {} }],
    });
    await router.push("/authorization/roles");
    await router.isReady();
    const wrapper = mount(AdminRouteShell, {
      props: {
        navigationItems: [{ id: "roles", label: "Roles", href: "/authorization/roles" }],
      },
      global: { plugins: [router], stubs: { RouterView: { template: "<div />" } } },
    });

    expect(wrapper.get('a[href="/authorization/roles"]').text()).toContain("Roles");
    expect(wrapper.find('a[href="/"]').exists()).toBe(false);
    expect(wrapper.find('a[href="/users"]').exists()).toBe(false);
  });
});
