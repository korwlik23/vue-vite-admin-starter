import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import UiAlert from "@/shared/components/ui/UiAlert.vue";
import UiPage from "@/shared/components/ui/UiPage.vue";
import UiPageHeader from "@/shared/components/ui/UiPageHeader.vue";
import UiTableFrame from "@/shared/components/ui/UiTableFrame.vue";
import UiToolbar from "@/shared/components/ui/UiToolbar.vue";

describe("layout component system", () => {
  it("provides a page shell with semantic heading and action slots", () => {
    const wrapper = mount({
      components: { UiPage, UiPageHeader },
      template: `
        <UiPage>
          <UiPageHeader title="Roles" description="Manage access">
            <template #actions><button type="button">Create role</button></template>
          </UiPageHeader>
          <p>Page body</p>
        </UiPage>
      `,
    });

    expect(wrapper.get(".ui-page").element.tagName).toBe("SECTION");
    expect(wrapper.get("h1").text()).toBe("Roles");
    expect(wrapper.text()).toContain("Manage access");
    expect(wrapper.get("button").text()).toBe("Create role");
  });

  it("provides toolbar alert and table frame without owning feature table markup", () => {
    const wrapper = mount({
      components: { UiAlert, UiTableFrame, UiToolbar },
      template: `
        <UiToolbar aria-label="Role filters"><input aria-label="Search"></UiToolbar>
        <UiAlert variant="danger" title="Could not load">Try again.</UiAlert>
        <UiTableFrame><table><caption>Roles</caption><tbody><tr><td>Editor</td></tr></tbody></table></UiTableFrame>
      `,
    });

    expect(wrapper.get('[role="toolbar"]').attributes("aria-label")).toBe("Role filters");
    expect(wrapper.get('[role="alert"]').text()).toContain("Could not load");
    expect(wrapper.get(".ui-table-frame > table").element.tagName).toBe("TABLE");
    expect(wrapper.get("caption").text()).toBe("Roles");
  });
});
