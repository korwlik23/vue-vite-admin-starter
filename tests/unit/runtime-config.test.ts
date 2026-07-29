import { describe, expect, it } from "vitest";

import { parseRuntimeConfig } from "@/app/runtime-config";

describe("U2", () => {
  it("accepts public runtime fields and normalizes the API base URL", () => {
    const config = parseRuntimeConfig({
      PUBLIC_API_BASE_URL: "https://api.tewarach-dev.me/api/v1/",
      PUBLIC_APP_NAME: "Starter Admin",
    });

    expect(config.apiBaseUrl).toBe("https://api.tewarach-dev.me/api/v1");
    expect(config.appName).toBe("Starter Admin");
  });

  it.each([
    {},
    { PUBLIC_API_BASE_URL: "javascript:alert(1)" },
    {
      PUBLIC_API_BASE_URL: "https://api.tewarach-dev.me",
      DATABASE_PASSWORD: "must-not-enter-the-browser",
    },
    {
      PUBLIC_API_BASE_URL: "https://api.tewarach-dev.me",
      PUBLIC_API_TOKEN: "must-not-enter-the-browser",
    },
  ])("rejects missing, unsafe, or secret-like runtime config", (source) => {
    expect(() => parseRuntimeConfig(source)).toThrow("runtime config");
  });
});
