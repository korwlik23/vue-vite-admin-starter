import { describe, expect, it } from "vitest";

import { parseCatalogCategory } from "@/i18n/catalog-schema";
import { mergeCatalog } from "@/i18n/merge-catalog";

describe("U6", () => {
  it("merges database overrides above bundle and explicit fallback", () => {
    const result = mergeCatalog({
      fallback: {
        "actions.cancel": "Cancel",
        "actions.save": "Save",
      },
      bundle: {
        "actions.save": "บันทึก",
      },
      overrides: {
        "actions.save": "จัดเก็บ",
      },
    });

    expect(result).toEqual({
      "actions.cancel": "Cancel",
      "actions.save": "จัดเก็บ",
    });
  });

  it.each(["", "Common", "a..b", "prototype.items", "../auth"])(
    "rejects unsafe catalog category %s",
    (category) => {
      expect(() => parseCatalogCategory(category)).toThrow("category");
    },
  );
});
