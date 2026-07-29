import { describe, expect, it } from "vitest";

import { authMutationOptions, createQueryClient } from "@/app/query-client";
import { APIError } from "@/shared/api/errors";

describe("U5", () => {
  it("uses bounded query retries and cache lifetimes", () => {
    const client = createQueryClient();
    const options = client.getDefaultOptions().queries;
    const retry = options?.retry;

    expect(options?.staleTime).toBe(30_000);
    expect(options?.gcTime).toBe(5 * 60_000);
    expect(typeof retry).toBe("function");
    if (typeof retry === "function") {
      expect(retry(0, new Error("temporary"))).toBe(true);
      expect(retry(2, new Error("temporary"))).toBe(false);
      expect(
        retry(
          0,
          new APIError({
            code: "unauthorized",
            message: "Unauthorized",
            status: 401,
          }),
        ),
      ).toBe(false);
    }
  });

  it("never retries authentication mutations automatically", () => {
    expect(authMutationOptions.retry).toBe(false);
  });
});
