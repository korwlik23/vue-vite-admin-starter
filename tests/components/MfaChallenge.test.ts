import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import MfaChallengeView from "@/modules/identity/views/MfaChallengeView.vue";

describe("U12", () => {
  it("renders only for a pending session and refreshes CSRF", async () => {
    const refreshCSRF = vi.fn().mockResolvedValue("fresh-token");
    const verified = vi.fn();
    const wrapper = mount(MfaChallengeView, {
      props: {
        pending: true,
        methods: ["totp", "recovery_code"],
        refreshCSRF,
        submit: vi.fn().mockResolvedValue(undefined),
        verified,
      },
    });

    await vi.waitFor(() => expect(refreshCSRF).toHaveBeenCalledOnce());
    expect(wrapper.get("form").element.tagName).toBe("FORM");
    expect(wrapper.text()).toContain("Recovery code");
    await wrapper.get("#mfa-code").setValue("123456");
    await wrapper.get("form").trigger("submit");
    await vi.waitFor(() => expect(verified).toHaveBeenCalledOnce());
  });

  it("denies the challenge UI outside an MFA-pending session", () => {
    const wrapper = mount(MfaChallengeView, {
      props: {
        pending: false,
        methods: [],
        refreshCSRF: vi.fn(),
        submit: vi.fn(),
      },
    });

    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.text()).toContain("no longer available");
  });
});
