import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import LoginView from "@/modules/identity/views/LoginView.vue";

describe("U11D", () => {
  it("composes the login form and rejects an unsafe return URL", async () => {
    const navigate = vi.fn();
    const wrapper = mount(LoginView, {
      props: {
        authenticated: false,
        returnTo: "https://evil.example/steal",
        submit: vi.fn().mockResolvedValue({
          status: "authenticated",
          csrf_token: "rotated",
        }),
        navigate,
      },
    });
    await wrapper.get("#login-email").setValue("admin@example.com");
    await wrapper.get("#login-password").setValue("correct horse battery staple");
    await wrapper.get("form").trigger("submit");
    await vi.waitFor(() => {
      expect(wrapper.emitted("navigate")?.[0]).toEqual(["/"]);
    });
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("does not render an anonymous form for an authenticated session", () => {
    const wrapper = mount(LoginView, {
      props: {
        authenticated: true,
        submit: vi.fn(),
      },
    });

    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.text()).toContain("already signed in");
  });
});
