import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import ErrorState from "@/shared/components/feedback/ErrorState.vue";
import ForbiddenState from "@/shared/components/feedback/ForbiddenState.vue";
import LoadingState from "@/shared/components/feedback/LoadingState.vue";

describe("U13C", () => {
  it("announces loading without leaving a blank screen", () => {
    const wrapper = mount(LoadingState, { props: { label: "Loading locales" } });

    expect(wrapper.get('[role="status"]').text()).toContain("Loading locales");
  });

  it("offers a retry action for recoverable errors", async () => {
    const retry = vi.fn();
    const wrapper = mount(ErrorState, { props: { retry } });

    await wrapper.get("button").trigger("click");
    expect(retry).toHaveBeenCalledOnce();
  });

  it("explains permission denial without relying on color", () => {
    const wrapper = mount(ForbiddenState);

    expect(wrapper.get("h1").text()).toContain("Permission required");
    expect(wrapper.text()).toContain("administrator");
  });
});
