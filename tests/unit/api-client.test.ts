import { describe, expect, it, vi } from "vitest";

import { createAPIClient } from "@/shared/api/client";

describe("U3", () => {
  it("uses cookie credentials, request IDs, and CSRF for mutations", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    const csrf = { token: vi.fn().mockResolvedValue("csrf-value") };
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const client = createAPIClient({
      baseUrl: "https://api.tewarach-dev.me/api/v1",
      fetcher,
      csrf,
      requestID: () => "request-id",
    });

    await client.request("/locales/preferences", {
      method: "PUT",
      body: JSON.stringify({
        all_languages: true,
        locale_ids: [],
        expected_version: 0,
      }),
    });

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe(
      "https://api.tewarach-dev.me/api/v1/locales/preferences",
    );
    expect(init?.credentials).toBe("include");
    expect(new Headers(init?.headers).get("X-CSRF-Token")).toBe("csrf-value");
    expect(new Headers(init?.headers).get("X-Request-ID")).toBe("request-id");
    expect(setItem).not.toHaveBeenCalled();
  });

  it("does not request CSRF for safe reads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    const csrf = { token: vi.fn().mockResolvedValue("unused") };
    const client = createAPIClient({
      baseUrl: "https://api.tewarach-dev.me/api/v1",
      fetcher,
      csrf,
      requestID: () => "request-id",
    });

    await client.request("/locales");

    expect(csrf.token).not.toHaveBeenCalled();
  });
});
