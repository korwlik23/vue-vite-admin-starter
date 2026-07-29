import { describe, expect, it } from "vitest";

import { APIError, errorFromResponse, safeError } from "@/shared/api/errors";

describe("U4", () => {
  it("maps the stable API problem shape to a typed UX error", async () => {
    const error = await errorFromResponse(
      new Response(
        JSON.stringify({
          code: "validation_failed",
          message: "Please review the form.",
          fields: { email: ["invalid"] },
          request_id: "request-id",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    expect(error).toBeInstanceOf(APIError);
    expect(error.code).toBe("validation_failed");
    expect(error.fields.email).toEqual(["invalid"]);
    expect(error.requestID).toBe("request-id");
  });

  it("does not expose unknown internal failure details", () => {
    const error = safeError(new Error("database password leaked here"));

    expect(error.message).toBe("Something went wrong. Please try again.");
    expect(error.message).not.toContain("database");
  });
});
