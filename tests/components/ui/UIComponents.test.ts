import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import UIComponentsView from "@/modules/operations/views/UIComponentsView.vue";
import UiBadge from "@/shared/components/ui/UiBadge.vue";
import UiButton from "@/shared/components/ui/UiButton.vue";
import UiCard from "@/shared/components/ui/UiCard.vue";
import UiCheckbox from "@/shared/components/ui/UiCheckbox.vue";
import UiEmptyState from "@/shared/components/ui/UiEmptyState.vue";
import UiField from "@/shared/components/ui/UiField.vue";
import UiInput from "@/shared/components/ui/UiInput.vue";
import UiRadio from "@/shared/components/ui/UiRadio.vue";
import UiSelect from "@/shared/components/ui/UiSelect.vue";
import UiTextarea from "@/shared/components/ui/UiTextarea.vue";

describe("UI component system", () => {
  it("renders button variants and exposes loading as disabled busy state", async () => {
    const onClick = vi.fn();
    const wrapper = mount(UiButton, {
      props: { variant: "primary", onClick, loading: true, loadingLabel: "Saving" },
      slots: { default: "Save" },
    });

    expect(wrapper.get("button").classes()).toContain("ui-button--primary");
    expect(wrapper.get("button").attributes("aria-busy")).toBe("true");
    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Saving");
    await wrapper.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps field labels associated with reusable form controls", async () => {
    const wrapper = mount(UiField, {
      props: { id: "title", label: "Title", required: true, error: "Title is required" },
      slots: { default: () => mount(UiInput, { props: { id: "title", modelValue: "" } }).html() },
    });

    expect(wrapper.get("label").attributes("for")).toBe("title");
    expect(wrapper.get("label").text()).toContain("Title");
    expect(wrapper.text()).toContain("Title is required");
  });

  it("supports reusable select, textarea, card, badge and empty states", () => {
    const wrapper = mount({
      components: { UiSelect, UiTextarea, UiCard, UiBadge, UiEmptyState },
      template: `
        <UiCard title="Content">
          <UiBadge variant="success">Published</UiBadge>
          <UiSelect model-value="en" aria-label="Locale">
            <option value="en">English</option>
          </UiSelect>
          <UiTextarea model-value="Body" aria-label="Body" />
          <UiEmptyState title="No content" description="Create your first item." />
        </UiCard>
      `,
    });

    expect(wrapper.text()).toContain("Content");
    expect(wrapper.text()).toContain("Published");
    expect(wrapper.text()).toContain("No content");
    expect(wrapper.get("select").element.value).toBe("en");
    expect(wrapper.get("textarea").element.value).toBe("Body");
  });

  it("preserves checkbox and radio model updates", async () => {
    const checkbox = mount(UiCheckbox, { props: { modelValue: false }, slots: { default: "Enabled" } });
    await checkbox.get('input[type="checkbox"]').setValue(true);
    expect(checkbox.emitted("update:modelValue")?.at(-1)).toEqual([true]);

    const radio = mount(UiRadio, { props: { modelValue: "a", value: "b" }, slots: { default: "B" } });
    await radio.get('input[type="radio"]').setValue();
    expect(radio.emitted("update:modelValue")?.at(-1)).toEqual(["b"]);
  });

  it("renders the in-app showcase with representative states", () => {
    const wrapper = mount(UIComponentsView);

    expect(wrapper.get("h1").text()).toBe("UI Components");
    expect(wrapper.get(".ui-page").element.tagName).toBe("SECTION");
    expect(wrapper.find("main").exists()).toBe(false);
    expect(wrapper.text()).toContain("Buttons");
    expect(wrapper.text()).toContain("Form controls");
    expect(wrapper.text()).toContain("Selection controls");
    expect(wrapper.text()).toContain("Loading state");
    expect(wrapper.text()).toContain("Empty state");
  });
});
