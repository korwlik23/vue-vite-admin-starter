import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AdminRouteShell from "@/app/layouts/AdminRouteShell.vue";

describe("admin route shell", () => {
  it("exposes the foundation and authorization navigation links", () => {
    const wrapper = mount(AdminRouteShell, {
      global: { stubs: { RouterView: { template: "<div />" } } },
    });

    expect(wrapper.get('a[href="/"]').text()).toContain("Foundation");
    expect(wrapper.get('a[href="/authorization/roles"]').text()).toContain("Roles");
  });
});
