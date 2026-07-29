import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import App from "@/App.vue";

describe("admin scaffold", () => {
  it("renders semantic foundation landmarks", () => {
    const wrapper = mount(App);

    expect(wrapper.get("header").element.tagName).toBe("HEADER");
    expect(wrapper.get("main").attributes("id")).toBe("main-content");
    expect(wrapper.get('a[href="#main-content"]').text()).toBe("Skip to content");
    expect(wrapper.findAll("article")).toHaveLength(3);
  });
});
