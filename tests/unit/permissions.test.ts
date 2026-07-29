import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import Can from "@/shared/permissions/Can.vue";
import { hasPermission } from "@/shared/permissions/permissions";

describe("U8", () => {
  it("matches exact permissions and defaults to false", () => {
    const permissions = new Set(["localization.locales.manage.system"]);

    expect(
      hasPermission(permissions, "localization.locales.manage.system"),
    ).toBe(true);
    expect(hasPermission(permissions, "localization.locales.manage.any")).toBe(
      false,
    );
    expect(hasPermission(undefined, "localization.locales.manage.system")).toBe(
      false,
    );
  });

  it("renders protected UX only for an exact held permission", () => {
    const allowed = mount(Can, {
      props: {
        permission: "localization.locales.manage.system",
        permissions: ["localization.locales.manage.system"],
      },
      slots: { default: "Manage languages" },
    });
    const denied = mount(Can, {
      props: {
        permission: "localization.locales.manage.system",
        permissions: ["localization.locales.read.system"],
      },
      slots: { default: "Manage languages" },
    });

    expect(allowed.text()).toContain("Manage languages");
    expect(denied.text()).not.toContain("Manage languages");
  });
});
