import { describe, expect, it, vi } from "vitest";

import { listAuditEvents } from "@/modules/audit/api/events.client";
import { listEnabledModules } from "@/modules/operations/api/modules.client";
import type { APIClient } from "@/shared/api/client";

function clientWith(response: Response) {
  return { request: vi.fn<APIClient["request"]>().mockResolvedValue(response) } satisfies APIClient;
}

describe("audit and operations read adapters", () => {
  it("encodes bounded audit filters and cursor", async () => {
    const client = clientWith(new Response(JSON.stringify({ items: [], next_cursor: "next" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    }));

    const result = await listAuditEvents(client, {
      cursor: "cursor-value", limit: 25, action: "authorization.role.updated", actorID: "actor-1",
    });

    expect(result.next_cursor).toBe("next");
    expect(client.request).toHaveBeenCalledWith("/audit/events?cursor=cursor-value&limit=25&action=authorization.role.updated&actor_id=actor-1");
  });

  it("validates module projections before exposing them to the UI", async () => {
    const client = clientWith(new Response(JSON.stringify({ items: [{ id: "operations", enabled: true, reconcile_revision: 3 }] }), {
      status: 200, headers: { "Content-Type": "application/json" },
    }));

    const modules = await listEnabledModules(client);

    expect(modules).toEqual([{ id: "operations", enabled: true, reconcile_revision: 3 }]);
  });
});
