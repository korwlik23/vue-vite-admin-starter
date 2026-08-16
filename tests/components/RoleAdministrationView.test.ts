import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import RoleAdministrationView from "@/modules/authorization/views/RoleAdministrationView.vue";
import type { APIClient } from "@/shared/api/client";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function roleClient(): APIClient {
  return {
    request: vi.fn(async (path: string, init?: RequestInit) => {
      if (path === "/authorization/roles/role-1" && init?.method === "PATCH") {
        return response({
          id: "role-1", owner_type: "account", account_id: "account-1", name: "Reviewers",
          version: 3, created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
        });
      }
      if (path === "/authorization/roles/role-1/assignments" && init?.method === "POST") {
        return response({
          assignment_id: "assignment-2", role_id: "role-1", version: 3,
          affected_principals: 1,
          session_outcome: { current_principal: "unchanged", other_principals: "invalidated" },
        }, 201);
      }
      if (path === "/authorization/assignments/assignment-1" && init?.method === "DELETE") {
        return response({
          assignment_id: "assignment-1", revoked: true, version: 3,
          affected_principals: 1,
          session_outcome: { current_principal: "unchanged", other_principals: "invalidated" },
        });
      }
      if (path.startsWith("/authorization/roles?") || path === "/authorization/roles") {
        if (init?.method === "POST") {
          return response({
            id: "role-2", owner_type: "account", account_id: "account-1",
            name: "Reviewers", version: 1,
            created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
          }, 201);
        }
        return response({
          items: [{
            id: "role-1", owner_type: "account", account_id: "account-1",
            name: "Editors", version: 2,
            created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
          }],
          page: { page: 1, per_page: 25, total_items: 1, total_pages: 1 },
        });
      }
      if (path === "/authorization/roles/role-1/permissions") {
        return response({
          role_id: "role-1", role_version: 2,
          items: [{ permission_key: "authorization.roles.read.system", active: true, delegable: false, tier: "core" }],
        });
      }
      if (path.startsWith("/authorization/roles/role-1/assignments")) {
        return response({
          items: [{
            assignment_id: "assignment-1", role_id: "role-1", scope: "account",
            account_id: "account-1", user_id: "user-1", created_at: "2026-08-01T00:00:00Z",
          }], page: { page: 1, per_page: 25, total_items: 1, total_pages: 1 },
        });
      }
      return response({
        id: "role-1", owner_type: "account", account_id: "account-1", name: "Reviewers",
        version: 3, created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
      });
    }),
  };
}

describe("role administration view", () => {
  it("loads roles, permission projection, and assignments with accessible labels", async () => {
    const wrapper = mount(RoleAdministrationView, { props: { client: roleClient() } });
    await flushPromises();

    expect(wrapper.get("h1").text()).toBe("Role administration");
    expect(wrapper.text()).toContain("Editors");
    expect(wrapper.text()).toContain("authorization.roles.read.system");
    expect(wrapper.text()).toContain("user-1");
    expect(wrapper.get('label[for="role-name"]').text()).toContain("Role name");
  });

  it("submits an account role creation request and announces success", async () => {
    const client = roleClient();
    const wrapper = mount(RoleAdministrationView, { props: { client } });
    await flushPromises();

    await wrapper.get("#account-id").setValue("account-1");
    await wrapper.get("#role-name").setValue("Reviewers");
    await wrapper.get('form[aria-label="Create role"]').trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Role created");
    expect(client.request).toHaveBeenCalledWith(
      "/authorization/roles",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("renames, assigns, and revokes through the selected role contract", async () => {
    const client = roleClient();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const wrapper = mount(RoleAdministrationView, { props: { client } });
    await flushPromises();

    await wrapper.get("#rename-role-name").setValue("Reviewers");
    await wrapper.get('form[aria-label="Rename role"]').trigger("submit");
    await flushPromises();
    expect(wrapper.text()).toContain("Role updated");

    await wrapper.get("#assignment-user-id").setValue("user-2");
    await wrapper.get("#assignment-account-id").setValue("account-1");
    await wrapper.get('form[aria-label="Assign role"]').trigger("submit");
    await flushPromises();
    expect(wrapper.text()).toContain("Assignment created");

    const revoke = wrapper.findAll("button").find((button) => button.text() === "Revoke");
    expect(revoke).toBeDefined();
    await revoke!.trigger("click");
    await flushPromises();
    expect(confirm).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Assignment revoked");
  });
});
