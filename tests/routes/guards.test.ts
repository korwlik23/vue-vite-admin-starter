import { describe, expect, it } from "vitest";

import { requireAuthentication } from "@/app/router/guards/auth";
import { requireModule } from "@/app/router/guards/module";
import { requirePermission } from "@/app/router/guards/permission";

describe("U10", () => {
  it("redirects unauthenticated users to login with a safe return path", () => {
    expect(requireAuthentication(false, "/settings/locales")).toEqual({
      name: "login",
      query: { returnTo: "/settings/locales" },
    });
  });

  it("maps missing permissions to 403 and disabled modules to 404", () => {
    expect(
      requirePermission(
        ["localization.locales.read.system"],
        "localization.locales.manage.system",
      ),
    ).toEqual({ name: "forbidden" });
    expect(requireModule(["operations"], "localization")).toEqual({
      name: "not-found",
    });
  });

  it("allows enabled routes with an exact permission", () => {
    expect(
      requirePermission(
        ["localization.locales.manage.system"],
        "localization.locales.manage.system",
      ),
    ).toBe(true);
    expect(requireModule(["localization"], "localization")).toBe(true);
  });
});
