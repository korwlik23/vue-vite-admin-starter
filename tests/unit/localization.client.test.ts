import { describe, expect, it, vi } from "vitest";

import { getCatalog, updateCatalog } from "@/modules/localization/api/catalog.client";
import { listLocales, updateLocaleStatus } from "@/modules/localization/api/locales.client";
import type { APIClient } from "@/shared/api/client";

function clientWith(response: Response) {
  return { request: vi.fn<APIClient["request"]>().mockResolvedValue(response) } satisfies APIClient;
}

describe("localization API adapters", () => {
  it("lists locales and preserves optional optimistic versions", async () => {
    const client = clientWith(new Response(JSON.stringify({ items: [{
      id: "locale-1", code: "en", name: "English", direction: "ltr",
      enabled: true, selectable: true, default: true, version: 4,
    }] }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const result = await listLocales(client);

    expect(result.items[0]?.version).toBe(4);
  });

  it("sends expected versions for locale and catalog writes", async () => {
    const client = clientWith(new Response(JSON.stringify({
      id: "locale-1", enabled: false, selectable: false, version: 5,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    client.request.mockResolvedValueOnce(new Response(JSON.stringify({
      id: "locale-1", enabled: false, selectable: false, version: 5,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    client.request.mockResolvedValueOnce(new Response(JSON.stringify({
      locale: "th", category: "common", version: 7,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await updateLocaleStatus(client, "locale-1", { enabled: false, selectable: false, expected_version: 4 });
    await updateCatalog(client, {
      locale: "th", category: "common", entries: { "actions.save": "บันทึก" }, expected_version: 6,
    });

    expect(client.request).toHaveBeenNthCalledWith(1, "/locales/locale-1/status", expect.objectContaining({
      method: "PATCH", body: JSON.stringify({ enabled: false, selectable: false, expected_version: 4 }),
    }));
    expect(client.request).toHaveBeenNthCalledWith(2, "/localization/catalog", expect.objectContaining({
      method: "PUT", body: JSON.stringify({
        locale: "th", category: "common", entries: { "actions.save": "บันทึก" }, expected_version: 6,
      }),
    }));
  });

  it("rejects malformed catalog responses", async () => {
    const client = clientWith(new Response(JSON.stringify({ locale: "th", entries: [] }), { status: 200 }));

    await expect(getCatalog(client, "th", "common")).rejects.toThrow("Invalid catalog response");
  });
});
