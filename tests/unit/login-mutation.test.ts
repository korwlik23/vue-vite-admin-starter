import { describe, expect, it, vi } from "vitest";

import { loginMutationOptions } from "@/modules/identity/mutations/login.mutation";

describe("U11B", () => {
  it("establishes CSRF before login and invalidates session on success", async () => {
    const order: string[] = [];
    const csrf = {
      token: vi.fn(async () => {
        order.push("csrf");
        return "csrf-token";
      }),
    };
    const auth = {
      login: vi.fn(async () => {
        order.push("login");
        return { status: "authenticated" as const, csrf_token: "rotated" };
      }),
    };
    const invalidateQueries = vi.fn();
    const options = loginMutationOptions({
      auth,
      csrf,
      queryClient: { invalidateQueries },
    });

    await options.mutationFn({
      email: "admin@example.com",
      password: "correct horse battery staple",
    });
    await options.onSuccess();

    expect(order).toEqual(["csrf", "login"]);
    expect(options.retry).toBe(false);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["identity", "session"],
    });
  });
});
