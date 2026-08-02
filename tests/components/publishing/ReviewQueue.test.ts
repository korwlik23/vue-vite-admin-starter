import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import ReviewQueue from "@/modules/publishing/views/ReviewQueue.vue";
import type { PublishingContent } from "@/modules/publishing/api/content.client";

const reviewItem = {
  content_id: "content-review-1",
  translation_id: "translation-1",
  account_id: "account-1",
  locale_id: "locale-1",
  kind: "post" as const,
  content_key: "release-notes",
  content_status: "review" as const,
  content_version: 4,
  translation_status: "review" as const,
  translation_version: 3,
  slug: "release-notes",
  path: "/release-notes",
  title: "Release notes",
  excerpt: "Changes",
  blocks: [{ type: "text" as const, data: { text: "Changes" } }],
  seo: { title: "Release notes", description: "Changes", canonical_url: "", robots: "index,follow" },
  geo: { region: "", locality: "" },
  aeo: { question: "", answer: "" },
} satisfies PublishingContent;

describe("D3 ReviewQueue", () => {
  it("offers workflow actions without hardcoded roles", async () => {
    const transition = vi.fn().mockResolvedValue({
      content_id: reviewItem.content_id,
      translation_id: reviewItem.translation_id,
      content_status: "published",
      translation_status: "published",
      content_version: 5,
      translation_version: 4,
    });
    const wrapper = mount(ReviewQueue, {
      props: { items: [reviewItem], transition },
    });

    await wrapper.get('button[aria-label="Publish Release notes"]').trigger("click");

    expect(transition).toHaveBeenCalledWith({
      contentID: reviewItem.content_id,
      input: expect.objectContaining({ action: "publish", expected_version: 4 }),
    });
  });

  it("disables workflow actions while a mutation is pending", () => {
    const wrapper = mount(ReviewQueue, {
      props: { items: [reviewItem], transition: vi.fn(), busyContentID: reviewItem.content_id },
    });

    expect(wrapper.get('button[aria-label="Publish Release notes"]').attributes("disabled")).toBeDefined();
  });
});
