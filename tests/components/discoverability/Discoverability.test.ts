import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import DiscoverabilityView from "@/modules/discoverability/views/DiscoverabilityView.vue";
import RedirectsView from "@/modules/discoverability/views/RedirectsView.vue";
import type { ContentAudit } from "@/modules/discoverability/api/audits.client";
import type { Redirect } from "@/modules/discoverability/api/redirects.client";
import type { SEODefaults } from "@/modules/discoverability/api/settings.client";

const redirect: Redirect = {
  id: "redirect-1",
  account_id: "account-1",
  locale_id: "locale-1",
  source_path: "/old",
  destination_path: "/new",
  status_code: 301,
  enabled: true,
  version: 2,
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
};

const audit: ContentAudit = {
  id: "audit-1",
  account_id: "account-1",
  content_id: "content-1",
  translation_id: "translation-1",
  locale_id: "locale-1",
  content_version: 4,
  translation_version: 3,
  status: "warning",
  checks: [{
    rule_key: "seo.title",
    status: "warning",
    severity: "warning",
    message: "Title is short",
    observed_value: "Home",
  }],
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
};

const seo: SEODefaults = {
  id: "seo-1",
  account_id: "account-1",
  locale_id: "locale-1",
  title: "Site",
  description: "Site description",
  canonical_base: "https://example.com",
  robots: "index,follow",
  version: 2,
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
};

describe("D4 Discoverability", () => {
  it("updates redirects with optimistic version and safe confirmation", async () => {
    const update = vi.fn().mockResolvedValue({ ...redirect, version: 3 });
    const remove = vi.fn().mockResolvedValue(undefined);
    const confirmation = vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    const wrapper = mount(RedirectsView, { props: { redirects: [redirect], update, remove, create: vi.fn() } });

    await wrapper.get('button[aria-label="Save redirect /old"]').trigger("click");
    await wrapper.get('button[aria-label="Delete redirect /old"]').trigger("click");
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ expected_version: 2 }));
    expect(remove).toHaveBeenCalledWith({ id: redirect.id, expected_version: 2 });
    confirmation.mockRestore();
  });

  it("shows audit status and keeps server detail bounded", async () => {
    const runAudit = vi.fn().mockResolvedValue(audit);
    const saveSEO = vi.fn().mockResolvedValue({ ...seo, version: 3 });
    const wrapper = mount(DiscoverabilityView, { props: { audits: [audit], seo, runAudit, saveSEO } });
    await wrapper.get('button[aria-label="Run content audit"]').trigger("click");
    await flushPromises();

    expect(runAudit).toHaveBeenCalledOnce();
    expect(wrapper.text()).toContain("Title is short");
    expect(wrapper.text()).not.toContain("raw storage key");
  });
});
