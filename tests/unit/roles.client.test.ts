import { describe, expect, it, vi } from "vitest";

import {
  createRole,
  listRoleAssignments,
  listRolePermissions,
  listRoles,
  updateRole,
} from "@/modules/authorization/api/roles.client";
import type { APIClient } from "@/shared/api/client";

function clientWith(response: Response) {
  return {
    request: vi.fn<APIClient["request"]>().mockResolvedValue(response),
  } satisfies APIClient;
}

const role = {
  id: "role-1",
  owner_type: "account" as const,
  account_id: "account-1",
  name: "Editors",
  version: 2,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("authorization role API adapter", () => {
  it("bounds role list filters in the request URL and validates the page", async () => {
    const client = clientWith(
      new Response(
        JSON.stringify({
          items: [role],
          page: { page: 2, per_page: 10, total_items: 1, total_pages: 1 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await listRoles(client, {
      scope: "account",
      accountId: "account-1",
      page: 2,
      perPage: 10,
    });

    expect(client.request).toHaveBeenCalledWith(
      "/authorization/roles?scope=account&account_id=account-1&page=2&per_page=10",
    );
    expect(result.items[0]?.name).toBe("Editors");
  });

  it("uses the mutation contract for create and optimistic rename", async () => {
    const client = clientWith(new Response(JSON.stringify(role), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }));
    client.request.mockResolvedValueOnce(new Response(JSON.stringify(role), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }));
    client.request.mockResolvedValueOnce(new Response(JSON.stringify({ ...role, name: "Reviewers", version: 3 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await createRole(client, {
      scope: "account",
      account_id: "account-1",
      name: "Editors",
    });
    await updateRole(client, "role-1", { name: "Reviewers", expected_version: 2 });

    expect(client.request).toHaveBeenNthCalledWith(
      1,
      "/authorization/roles",
      expect.objectContaining({ method: "POST", body: JSON.stringify({
        scope: "account", account_id: "account-1", name: "Editors",
      }) }),
    );
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      "/authorization/roles/role-1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({
        name: "Reviewers", expected_version: 2,
      }) }),
    );
  });

  it("maps permission and assignment projections without trusting malformed JSON", async () => {
    const client = clientWith(
      new Response(JSON.stringify({
        role_id: "role-1", role_version: 2,
        items: [{ permission_key: "authorization.roles.read.system", active: true, delegable: false, tier: "core" }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    const permissions = await listRolePermissions(client, "role-1");
    expect(permissions.role_version).toBe(2);

    client.request.mockResolvedValueOnce(new Response(JSON.stringify({
      items: [{
        assignment_id: "assignment-1", role_id: "role-1", scope: "account",
        account_id: "account-1", user_id: "user-1", created_at: "2026-08-01T00:00:00Z",
      }], page: { page: 1, per_page: 25, total_items: 1, total_pages: 1 },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const assignments = await listRoleAssignments(client, "role-1", { page: 1, perPage: 25 });
    expect(assignments.items[0]?.user_id).toBe("user-1");
  });

  it("rejects a successful response that does not satisfy the role contract", async () => {
    const client = clientWith(
      new Response(JSON.stringify({ items: [], page: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(listRoles(client)).rejects.toThrow("Invalid role list response");
  });
});
