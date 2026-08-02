import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import RevisionHistory from "@/modules/publishing/views/RevisionHistory.vue";
import type { PublishingRevision } from "@/modules/publishing/api/revisions.client";

const revision: PublishingRevision = {
  id: "revision-1",
  content_id: "content-1",
  translation_id: "translation-1",
  author_id: "author-1",
  snapshot_hash: "a".repeat(64),
  change_summary: "Fix title",
  source_version: 3,
  created_at: "2026-08-02T00:00:00Z",
};

describe("D3 RevisionHistory", () => {
  it("shows an immutable revision summary and asks the server to rollback", async () => {
    const confirmation = vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    const rollback = vi.fn().mockResolvedValue({
      revision,
      content: {
        content_id: revision.content_id,
        translation_id: revision.translation_id,
        content_version: 4,
        translation_version: 4,
        status: "draft",
      },
    });
    const wrapper = mount(RevisionHistory, {
      props: { contentID: revision.content_id, contentVersion: 4, revisions: [revision], rollback },
    });

    expect(wrapper.text()).toContain("Fix title");
    await wrapper.get('button[aria-label="Rollback revision Fix title"]').trigger("click");

    expect(rollback).toHaveBeenCalledWith(revision);
    confirmation.mockRestore();
  });

  it("renders a safe empty state when there are no revisions", () => {
    const wrapper = mount(RevisionHistory, { props: { contentID: "content-1", revisions: [], rollback: vi.fn() } });

    expect(wrapper.text()).toContain("No revisions");
    expect(wrapper.text()).not.toContain("snapshot_hash");
  });
});
