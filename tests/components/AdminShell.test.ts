import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AdminShell from "@/app/layouts/AdminShell.vue";

describe("U13A", () => {
  it("provides semantic landmarks, skip navigation, and a focusable main target", () => {
    const wrapper = mount(AdminShell, {
      slots: {
        navigation: "<a href='/'>Dashboard</a>",
        default: "<h1>Dashboard</h1>",
      },
    });

    expect(wrapper.get("header").element.tagName).toBe("HEADER");
    expect(wrapper.get("nav").attributes("aria-label")).toBe(
      "Primary navigation",
    );
    expect(wrapper.get("main").attributes()).toMatchObject({
      id: "admin-main",
      tabindex: "-1",
    });
    expect(wrapper.get('a[href="#admin-main"]').text()).toContain(
      "Skip to content",
    );
  });
});
