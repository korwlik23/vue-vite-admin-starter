import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import MediaLibraryView from "@/modules/media/views/MediaLibraryView.vue";
import type { Asset } from "@/modules/media/api/assets.client";

const asset: Asset = {
  id: "asset-1",
  account_id: "account-1",
  original_name: "hero.png",
  mime_type: "image/png",
  byte_size: 2048,
  sha256: "a".repeat(64),
  version: 2,
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  width: 1200,
  height: 630,
};

describe("D4 MediaLibrary", () => {
  it("renders safe asset metadata and does not expose storage keys", () => {
    const wrapper = mount(MediaLibraryView, {
      props: { assets: [asset], upload: vi.fn(), remove: vi.fn() },
    });

    expect(wrapper.text()).toContain("hero.png");
    expect(wrapper.text()).toContain("image/png");
    expect(wrapper.text()).not.toContain("storage/");
  });

  it("shows a useful empty state", () => {
    const wrapper = mount(MediaLibraryView, { props: { assets: [], upload: vi.fn(), remove: vi.fn() } });
    expect(wrapper.text()).toContain("No media assets");
  });
});
