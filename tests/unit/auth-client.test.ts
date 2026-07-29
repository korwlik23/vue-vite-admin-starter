import { describe, expect, it, vi } from "vitest";

import { createAuthClient } from "@/modules/identity/api/auth.client";

describe("U11A", () => {
  it("wraps generated auth contracts behind a typed module adapter", async () => {
    const request = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "mfa_pending",
          challenge_id: "challenge-id",
          csrf_token: "csrf-token",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      ),
    );
    const auth = createAuthClient({ request });

    const result = await auth.login({
      email: "admin@example.com",
      password: "correct horse battery staple",
    });

    expect(request).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@example.com",
        password: "correct horse battery staple",
      }),
    });
    expect(result.status).toBe("mfa_pending");
  });
});
