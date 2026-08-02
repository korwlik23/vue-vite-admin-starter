import { describe, expect, it } from "vitest";

import {
  parseContentMutation,
  validatePublishingBlocks,
} from "@/modules/publishing/schemas/content.schema";

const metadata = {
  seo: {
    title: "Home",
    description: "Home page",
    canonical_url: "",
    robots: "index,follow",
  },
  geo: { region: "", locality: "" },
  aeo: { question: "", answer: "" },
};

describe("D2 publishing schemas", () => {
  it("accepts schema-valid structured blocks", () => {
    const result = parseContentMutation({
      kind: "page",
      content_key: "home",
      locale: "en-US",
      slug: "home",
      path: "/home",
      title: "Home",
      excerpt: "",
      blocks: [
        { type: "text", data: { text: "Hello" } },
        { type: "image", data: { asset_id: "asset-1", alt: "A hero" } },
      ],
      ...metadata,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.blocks[0]?.type).toBe("text");
    }
  });

  it("rejects unknown block types and non-object block data", () => {
    expect(validatePublishingBlocks([{ type: "video", data: {} }])).toEqual({
      "blocks.0.type": ["Choose a supported block type."],
    });
    expect(validatePublishingBlocks([{ type: "text", data: "raw html" }])).toEqual({
      "blocks.0.data": ["Block data must be a structured object."],
    });
  });

  it("rejects unknown top-level fields before the editor sends them", () => {
    const result = parseContentMutation({
      locale: "en-US",
      slug: "home",
      path: "/home",
      title: "Home",
      excerpt: "",
      blocks: [{ type: "text", data: { text: "Hello" } }],
      ...metadata,
      server_secret: "must-not-be-sent",
    });

    expect(result).toEqual({
      success: false,
      errors: { server_secret: ["This field is not accepted."] },
    });
  });
});
