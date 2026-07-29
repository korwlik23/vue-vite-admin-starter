import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import LoginForm from "@/modules/identity/components/LoginForm.vue";

describe("U11C", () => {
  it("has associated labels, inline errors, and an error summary", async () => {
    const wrapper = mount(LoginForm, {
      props: { onSubmit: vi.fn() },
    });

    await wrapper.get("form").trigger("submit");

    expect(wrapper.get('label[for="login-email"]').text()).toContain("Email");
    expect(wrapper.get('label[for="login-password"]').text()).toContain(
      "Password",
    );
    expect(wrapper.get('[role="alert"]').text()).toContain(
      "Please review the highlighted fields.",
    );
    expect(wrapper.get("#login-email-error").text()).toContain("required");
  });

  it("prevents double submit while the request is pending", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((done) => {
      resolve = done;
    });
    const onSubmit = vi.fn(() => pending);
    const wrapper = mount(LoginForm, { props: { onSubmit } });
    await wrapper.get("#login-email").setValue("admin@example.com");
    await wrapper.get("#login-password").setValue("correct horse battery staple");

    await wrapper.get("form").trigger("submit");
    await wrapper.get("form").trigger("submit");

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(wrapper.get('button[type="submit"]').attributes()).toHaveProperty(
      "disabled",
    );
    resolve();
    await pending;
  });
});
