import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import CatalogEditorView from "@/modules/localization/views/CatalogEditorView.vue";
import type { APIClient } from "@/shared/api/client";

vi.mock("vue-router", () => ({ onBeforeRouteLeave: vi.fn() }));

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function catalogClient(): APIClient {
  return {
    request: vi.fn(async (path: string, init?: RequestInit) => {
      if (path === "/locales") {
        return response({ items: [{
          id: "locale-en", code: "en", name: "English", direction: "ltr",
          enabled: true, selectable: true, default: true, version: 1,
        }] });
      }
      if (path.startsWith("/localization/catalog?")) {
        return response({ locale: "en", category: "common", version: 2, entries: { "actions.save": "Save" } });
      }
      if (path === "/localization/catalog" && init?.method === "PUT") {
        return response({ locale: "en", category: "common", version: 3 });
      }
      return response({ message: "missing fixture" }, 404);
    }),
  };
}

describe("catalog editor view", () => {
  it("initializes a catalog, tracks dirty state, and saves with optimistic version", async () => {
    const client = catalogClient();
    const wrapper = mount(CatalogEditorView, { props: { client } });
    await flushPromises();

    expect(wrapper.get("h1").text()).toBe("Catalog editor");
    expect(wrapper.text()).toContain("actions.save");
    const valueInput = wrapper.get("tbody input");
    await valueInput.setValue("Save now");
    expect(wrapper.text()).toContain("Unsaved changes");

    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);

    await wrapper.get("button").findAll("button");
    const save = wrapper.findAll("button").find((button) => button.text() === "Save catalog");
    await save!.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Catalog saved");
    expect(client.request).toHaveBeenCalledWith(
      "/localization/catalog",
      expect.objectContaining({ method: "PUT" }),
    );
    wrapper.unmount();
  });
});
