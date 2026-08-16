import { describe, expect, it } from "vitest";

import { buildAdminNavigationItems } from "@/app/navigation";

describe("D5", () => {
  it("shows module links only when the module and exact permission are active", () => {
    expect(buildAdminNavigationItems(["media", "navigation"], ["media.assets.read.own"])).toEqual([
      { id: "media", label: "Media", href: "/media" },
    ]);
  });

  it("gates Foundation with the same module and permission as its route", () => {
    expect(buildAdminNavigationItems(["operations"], [])).toEqual([]);
    expect(buildAdminNavigationItems([], ["operations.foundation.read.system"])).toEqual([]);
    expect(buildAdminNavigationItems(["operations"], ["operations.foundation.read.system"]))
      .toContainEqual({ id: "foundation", label: "Foundation", href: "/" });
  });
});
