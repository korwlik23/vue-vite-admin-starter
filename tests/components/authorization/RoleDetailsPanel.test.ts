import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import RoleAssignmentsPanel from "@/modules/authorization/components/RoleAssignmentsPanel.vue";
import RolePermissionProjection from "@/modules/authorization/components/RolePermissionProjection.vue";
import RoleSummaryPanel from "@/modules/authorization/components/RoleSummaryPanel.vue";

const role = {
  id: "role-1", owner_type: "account" as const, account_id: "account-1", name: "Editors",
  version: 2, created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
};

describe("role detail sections", () => {
  it("keeps summary inputs and typed rename command local to the summary", async () => {
    const wrapper = mount(RoleSummaryPanel, { props: { role, renameName: "Editors", busy: false } });
    await wrapper.get("#rename-role-name").setValue("Reviewers");
    await wrapper.get("form").trigger("submit");
    expect(wrapper.emitted("update:renameName")?.at(-1)).toEqual(["Reviewers"]);
    expect(wrapper.emitted("rename")).toHaveLength(1);
  });

  it("renders permission projection in a feature-owned table", () => {
    const wrapper = mount(RolePermissionProjection, { props: {
      loading: false,
      permissions: { role_id: role.id, role_version: role.version, items: [
        { permission_key: "authorization.roles.read.system", active: true, delegable: false, tier: "core" as const },
      ] },
    } });
    expect(wrapper.get("caption").text()).toContain("Permissions granted");
    expect(wrapper.text()).toContain("authorization.roles.read.system");
  });

  it("emits assignment and revoke commands without making API calls", async () => {
    const wrapper = mount(RoleAssignmentsPanel, { props: {
      assignments: { items: [{
        assignment_id: "assignment-1", role_id: role.id, scope: "account" as const,
        account_id: "account-1", user_id: "user-1", created_at: "2026-08-01T00:00:00Z",
      }], page: { page: 1, per_page: 25, total_items: 1, total_pages: 1 } },
      assignmentScope: "account", assignmentAccountId: "account-1",
      assignmentUserId: "user-2", busy: false,
    } });
    await wrapper.get('form[aria-label="Assign role"]').trigger("submit");
    await wrapper.get('button[aria-label="Revoke assignment user-1"]').trigger("click");
    expect(wrapper.emitted("assign")).toHaveLength(1);
    expect(wrapper.emitted("revoke")?.at(-1)).toEqual(["assignment-1"]);
  });
});
