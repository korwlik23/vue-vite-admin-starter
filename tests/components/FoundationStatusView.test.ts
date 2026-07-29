import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import FoundationStatusView from "@/modules/operations/views/FoundationStatusView.vue";

describe("U13D", () => {
  it("renders current account, selected locale, and enabled modules", () => {
    const wrapper = mount(FoundationStatusView, {
      props: {
        state: "success",
        account: { name: "Personal workspace", slug: "personal" },
        selectedLocale: "th",
        enabledModules: ["localization", "operations"],
        retry: vi.fn(),
      },
    });

    expect(wrapper.text()).toContain("Personal workspace");
    expect(wrapper.text()).toContain("th");
    expect(wrapper.text()).toContain("localization");
  });

  it("uses explicit loading and retryable error states", async () => {
    const retry = vi.fn();
    const loading = mount(FoundationStatusView, {
      props: { state: "loading", retry },
    });
    const error = mount(FoundationStatusView, {
      props: { state: "error", retry },
    });

    expect(loading.get('[role="status"]').element.tagName).toBe("DIV");
    await error.get("button").trigger("click");
    expect(retry).toHaveBeenCalledOnce();
  });
});
