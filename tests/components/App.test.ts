import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import App from "@/App.vue";

describe("admin application root", () => {
  it("delegates screen rendering to the production router", () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: "<main>Current route</main>" },
        },
      },
    });

    expect(wrapper.get("main").text()).toBe("Current route");
  });
});
