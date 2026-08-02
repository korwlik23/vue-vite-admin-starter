import { describe, expect, it } from "vitest";

import { buildAdminNavigationItems } from "@/app/navigation";

describe("D5", () => {
  it("shows module links only when the module and exact permission are active", () => {
    expect(buildAdminNavigationItems(["media", "navigation"], ["media.assets.read.own"])).toEqual([
      { id: "foundation", label: "Foundation", href: "/" },
      { id: "media", label: "Media", href: "/media" },
    ]);
  });
});
