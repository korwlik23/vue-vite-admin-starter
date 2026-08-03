import { describe, expect, it, vi } from "vitest";

import {
	createPublishingPage,
	deletePublishingPage,
	listPublishingPages,
	updatePublishingPage,
} from "@/modules/publishing/api/content.client";
import {
  listPublishingRevisions,
  rollbackPublishingRevision,
} from "@/modules/publishing/api/revisions.client";
import {
  cancelPublishingSchedule,
  createPublishingSchedule,
  listPublishingSchedules,
} from "@/modules/publishing/api/schedules.client";
import { transitionPublishingWorkflow } from "@/modules/publishing/api/workflow.client";
import { createPublishingContentSubmitter } from "@/modules/publishing/mutations/content.mutations";
import type { APIClient } from "@/shared/api/client";

const content = {
  content_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67582",
  translation_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67583",
  account_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67584",
  locale_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67585",
  kind: "page" as const,
  content_key: "home",
  content_status: "draft" as const,
  content_version: 3,
  translation_status: "draft" as const,
  translation_version: 2,
  slug: "home",
  path: "/home",
  title: "Home",
  excerpt: "A short excerpt",
  blocks: [{ type: "text" as const, data: { text: "Hello" } }],
  seo: {
    title: "Home",
    description: "Home page",
    canonical_url: "",
    robots: "index,follow",
  },
  geo: { region: "", locality: "" },
  aeo: { question: "", answer: "" },
};

const revision = {
  id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67586",
  content_id: content.content_id,
  translation_id: content.translation_id,
  author_id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67587",
  snapshot_hash: "a".repeat(64),
  change_summary: "Initial draft",
  source_version: 2,
  created_at: "2026-08-02T00:00:00Z",
};

function clientWith(response: Response) {
  return {
    request: vi.fn<APIClient["request"]>().mockResolvedValue(response),
  } satisfies APIClient;
}

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function problemResponse(status: number, code: string) {
  return jsonResponse(
    {
      code,
      message: "The request could not be completed safely.",
      fields: { expected_version: ["The version is stale."] },
      request_id: "request-publishing-d2",
    },
    status,
  );
}

describe("D2 publishing clients", () => {
	it("lists content with a locale and opaque cursor", async () => {
		const client = clientWith(jsonResponse({
			items: [{
				content_id: content.content_id,
				account_id: content.account_id,
				locale_id: content.locale_id,
				kind: "page",
				content_key: content.content_key,
				content_status: "draft",
				content_version: content.content_version,
				translation_id: content.translation_id,
				translation_status: "draft",
				translation_version: content.translation_version,
				slug: content.slug,
				path: content.path,
				title: content.title,
				updated_at: "2026-08-02T00:00:00Z",
			}],
			next: { id: content.content_id, updated_at: "2026-08-02T00:00:00Z" },
		}));

		const result = await listPublishingPages(client, {
			locale: "en",
			limit: 25,
			afterUpdatedAt: "2026-08-01T00:00:00Z",
			afterId: content.content_id,
		});

		expect(result.items[0]?.title).toBe("Home");
		expect(client.request).toHaveBeenCalledWith(
			`/publishing/pages?locale=en&limit=25&after_updated_at=2026-08-01T00%3A00%3A00Z&after_id=${content.content_id}`,
		);
	});

	it("creates content through the typed page contract", async () => {
    const client = clientWith(jsonResponse(content, 201));

    const result = await createPublishingPage(client, {
      kind: "page",
      content_key: "home",
      locale: "en-US",
      slug: "home",
      path: "/home",
      title: "Home",
      excerpt: "A short excerpt",
      blocks: [{ type: "text", data: { text: "Hello" } }],
      seo: content.seo,
      geo: content.geo,
      aeo: content.aeo,
    });

    expect(result.content_version).toBe(3);
    expect(client.request).toHaveBeenCalledWith(
      "/publishing/pages",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.parse(String(client.request.mock.calls[0]?.[1]?.body))).toMatchObject({
      kind: "page",
      content_key: "home",
    });
  });

  it("preserves revision cursors, optimistic versions, and schedule idempotency", async () => {
    const client = clientWith(jsonResponse({ items: [revision], next: { created_at: revision.created_at, id: revision.id } }));

    await listPublishingRevisions(client, content.content_id, {
      translationId: content.translation_id,
      limit: 10,
      afterCreatedAt: revision.created_at,
      afterId: revision.id,
    });
    expect(client.request).toHaveBeenCalledWith(
      expect.stringContaining(
        `/publishing/content/${content.content_id}/revisions?translation_id=${content.translation_id}&limit=10&after_created_at=`,
      ),
    );

    client.request.mockResolvedValueOnce(
      jsonResponse({
        revision,
        content: {
          content_id: content.content_id,
          translation_id: content.translation_id,
          content_version: 4,
          translation_version: 3,
          status: "draft",
        },
      }),
    );
    await rollbackPublishingRevision(client, content.content_id, revision.id, {
      translation_id: content.translation_id,
      locale_id: content.locale_id,
      expected_version: 3,
      change_summary: "Restore draft",
    });

    client.request.mockResolvedValueOnce(
      jsonResponse({
        content_id: content.content_id,
        translation_id: content.translation_id,
        content_status: "review",
        translation_status: "review",
        content_version: 5,
        translation_version: 4,
      }),
    );
    await transitionPublishingWorkflow(client, content.content_id, {
      translation_id: content.translation_id,
      locale_id: content.locale_id,
      expected_version: 4,
      action: "submit_review",
    });

    client.request.mockResolvedValueOnce(
      jsonResponse({
        items: [
          {
            id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67588",
            account_id: content.account_id,
            translation_id: content.translation_id,
            publish_at: "2026-08-03T00:00:00Z",
            expected_version: 5,
            idempotency_key: "schedule-1",
            state: "pending",
            attempts: 0,
          },
        ],
      }),
    );
    await listPublishingSchedules(client, { limit: 25 });
    expect(client.request).toHaveBeenCalledWith("/publishing/schedules?limit=25");

    client.request.mockResolvedValueOnce(
      jsonResponse({
        id: "018f1f64-7b2a-7c10-8bf2-3c40d5f67588",
        account_id: content.account_id,
        translation_id: content.translation_id,
        publish_at: "2026-08-03T00:00:00Z",
        expected_version: 5,
        idempotency_key: "schedule-1",
        state: "pending",
        attempts: 0,
      }, 201),
    );
    await createPublishingSchedule(client, {
      translation_id: content.translation_id,
      publish_at: "2026-08-03T00:00:00Z",
      expected_version: 5,
      idempotency_key: "schedule-1",
    });
    expect(JSON.parse(String(client.request.mock.calls.at(-1)?.[1]?.body))).toMatchObject({
      expected_version: 5,
      idempotency_key: "schedule-1",
    });

    client.request.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await cancelPublishingSchedule(client, "018f1f64-7b2a-7c10-8bf2-3c40d5f67588");
  });

  it.each([
    [401, "authentication_required"],
    [403, "permission_denied"],
    [404, "content_not_found"],
    [409, "content_version_conflict"],
    [422, "invalid_content"],
  ] as const)("keeps the safe server error for %s", async (status, code) => {
    const client = clientWith(problemResponse(status, code));

    await expect(
      updatePublishingPage(client, content.content_id, {
        translation_id: content.translation_id,
        locale: "en-US",
        slug: "home",
        path: "/home",
        title: "Home",
        excerpt: "A short excerpt",
        blocks: [{ type: "text", data: { text: "Hello" } }],
        seo: content.seo,
        geo: content.geo,
        aeo: content.aeo,
        expected_version: 3,
      }),
    ).rejects.toMatchObject({ status, code });
  });

  it("does not parse a body for a successful delete", async () => {
    const client = clientWith(new Response(null, { status: 204 }));
    await deletePublishingPage(client, content.content_id, {
      translation_id: content.translation_id,
      locale_id: content.locale_id,
      expected_version: 3,
    });
    expect(client.request).toHaveBeenCalledWith(
      `/publishing/pages/${content.content_id}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("prevents duplicate content submits while the first request is pending", async () => {
    let release!: (value: typeof content) => void;
    const request = vi.fn(() => new Promise<typeof content>((resolve) => { release = resolve; }));
    const submitter = createPublishingContentSubmitter(request);

    const first = submitter.submit(content);
    const second = submitter.submit(content);

    expect(second).toBe(first);
    expect(request).toHaveBeenCalledOnce();
    expect(submitter.isPending).toBe(true);

    release(content);
    await first;
    expect(submitter.isPending).toBe(false);
  });
});
