import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AdminShell from "@/app/layouts/AdminShell.vue";
import LocaleSwitcher from "@/shared/components/shell/LocaleSwitcher.vue";

describe("U13B", () => {
  it("exposes mobile disclosure state and closes it with Escape", async () => {
    const wrapper = mount(AdminShell);
    const toggle = wrapper.get('button[aria-controls="admin-navigation"]');

    expect(toggle.attributes("aria-expanded")).toBe("false");
    await toggle.trigger("click");
    expect(toggle.attributes("aria-expanded")).toBe("true");
    await wrapper.get(".admin-shell").trigger("keydown", { key: "Escape" });
    expect(toggle.attributes("aria-expanded")).toBe("false");
  });

  it("switches among the eligible locale options", async () => {
    const wrapper = mount(LocaleSwitcher, {
      props: {
        modelValue: "en",
        locales: [
          { code: "en", name: "English" },
          { code: "th", name: "ไทย" },
        ],
      },
    });

    await wrapper.get("select").setValue("th");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["th"]);
  });
});
