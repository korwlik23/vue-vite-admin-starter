import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import CatalogTransferActions from "@/modules/localization/components/CatalogTransferActions.vue";

describe("catalog transfer actions", () => {
  it("owns file reset and emits typed export/import commands", async () => {
    const wrapper = mount(CatalogTransferActions, {
      props: { transferring: "", disabled: false },
    });
    await wrapper.get('button[type="button"]').trigger("click");
    expect(wrapper.emitted("export")).toHaveLength(1);

    const file = new File(["{}"], "catalog.json", { type: "application/json" });
    const input = wrapper.get('input[type="file"]').element as HTMLInputElement;
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    await wrapper.get('input[type="file"]').trigger("change");
    expect(wrapper.emitted("import")?.at(-1)?.[0]).toBe(file);
    expect(input.value).toBe("");
  });
});
