import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import ContentEditor from "@/modules/publishing/views/ContentEditor.vue";
import type { PublishingContent } from "@/modules/publishing/api/content.client";

const savedContent: PublishingContent = {
  content_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67582",
  translation_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67583",
  account_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67584",
  locale_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67585",
  kind: "page",
  content_key: "home",
  content_status: "draft",
  content_version: 2,
  translation_status: "draft",
  translation_version: 2,
  slug: "home",
  path: "/home",
  title: "Home",
  excerpt: "Home excerpt",
  blocks: [{ type: "text", data: { text: "Hello" } }],
  seo: { title: "Home", description: "Home", canonical_url: "", robots: "index,follow" },
  geo: { region: "", locality: "" },
  aeo: { question: "", answer: "" },
};

describe("D3 ContentEditor", () => {
  it("submits a schema-valid editor payload and announces success", async () => {
    const submit = vi.fn().mockResolvedValue(savedContent);
    const wrapper = mount(ContentEditor, {
      props: {
        mode: "create",
        submit,
        initial: { content_key: "home", slug: "home", path: "/home" },
      },
    });

    await wrapper.get('input[name="title"]').setValue("Home");
    await wrapper.get('input[name="slug"]').setValue("home");
    await wrapper.get('input[name="path"]').setValue("/home");
    await wrapper.get('textarea[name="excerpt"]').setValue("Home excerpt");
    await wrapper.get('form[aria-label="Content form"]').trigger("submit");
    await flushPromises();

    expect(submit).toHaveBeenCalledOnce();
    expect(submit.mock.calls[0]?.[0]).toMatchObject({
      title: "Home",
      blocks: [{ type: "text", data: { text: "Hello" } }],
    });
    expect(wrapper.text()).toContain("Content saved");
  });

  it("prevents duplicate submits while the save is pending", async () => {
    let release!: (value: PublishingContent) => void;
    const submit = vi.fn(() => new Promise<PublishingContent>((resolve) => { release = resolve; }));
    const wrapper = mount(ContentEditor, {
      props: {
        mode: "create",
        submit,
        initial: { content_key: "home", slug: "home", path: "/home", title: "Home" },
      },
    });

    const form = wrapper.get('form[aria-label="Content form"]');
    await form.trigger("submit");
    await form.trigger("submit");

    expect(submit).toHaveBeenCalledOnce();
    expect(wrapper.get('button[type="submit"]').attributes("disabled")).toBeDefined();
    release(savedContent);
    await flushPromises();
    expect(wrapper.text()).toContain("Content saved");
  });
});
