import { computed, onMounted, ref } from "vue";

import {
  assignRole as assignRoleRequest,
  createRole as createRoleRequest,
  listRoleAssignments,
  listRolePermissions,
  listRoles,
  revokeRole,
  updateRole,
  type Role,
  type RoleAssignments,
  type RolePermissions,
} from "@/modules/authorization/api/roles.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

export function useRoleAdministration(
  client: APIClient,
  initialAccountID?: string | (() => string | undefined),
) {
  const roles = ref<Role[]>([]);
  const selectedRoleId = ref("");
  const permissions = ref<RolePermissions>();
  const assignments = ref<RoleAssignments>();
  const loading = ref(true);
  const detailLoading = ref(false);
  const busy = ref(false);
  const errorMessage = ref("");
  const formError = ref("");
  const notice = ref("");
  const accountId = ref(resolveAccountID(initialAccountID));
  const createName = ref("");
  const renameName = ref("");
  const assignmentScope = ref<"account" | "system">("account");
  const assignmentAccountId = ref(accountId.value);
  const assignmentUserId = ref("");
  const selectedRole = computed(() => roles.value.find((role) => role.id === selectedRoleId.value));

  async function loadDetails(): Promise<void> {
    const roleID = selectedRoleId.value;
    if (roleID === "") {
      permissions.value = undefined;
      assignments.value = undefined;
      renameName.value = "";
      return;
    }
    renameName.value = selectedRole.value?.name ?? "";
    detailLoading.value = true;
    try {
      [permissions.value, assignments.value] = await Promise.all([
        listRolePermissions(client, roleID),
        listRoleAssignments(client, roleID),
      ]);
    } catch (error) {
      errorMessage.value = safeError(error).message;
    } finally {
      detailLoading.value = false;
    }
  }

  async function loadRoles(): Promise<void> {
    loading.value = true;
    errorMessage.value = "";
    try {
      roles.value = (await listRoles(client)).items;
      if (!roles.value.some((role) => role.id === selectedRoleId.value)) {
        selectedRoleId.value = roles.value[0]?.id ?? "";
      }
      await loadDetails();
    } catch (error) {
      errorMessage.value = safeError(error).message;
    } finally {
      loading.value = false;
    }
  }

  function selectRole(roleID: string): void {
    selectedRoleId.value = roleID;
    clearFeedback();
    void loadDetails();
  }

  async function submitCreateRole(): Promise<void> {
    const name = createName.value.trim();
    const targetAccountID = accountId.value.trim();
    if (!validate(targetAccountID !== "" && name !== "", "Account ID and role name are required.")) return;
    await mutate(async () => {
      const created = await createRoleRequest(client, { scope: "account", account_id: targetAccountID, name });
      createName.value = "";
      notice.value = "Role created.";
      await loadRoles();
      selectedRoleId.value = created.id;
      await loadDetails();
    });
  }

  async function submitRenameRole(): Promise<void> {
    const role = selectedRole.value;
    const name = renameName.value.trim();
    if (!validate(Boolean(role) && name !== "", "Select a role and enter a name.")) return;
    await mutate(async () => {
      const updated = await updateRole(client, role!.id, { name, expected_version: role!.version });
      roles.value = roles.value.map((item) => item.id === updated.id ? updated : item);
      renameName.value = updated.name;
      notice.value = "Role updated.";
    }, loadRoles);
  }

  async function submitAssignment(): Promise<void> {
    const role = selectedRole.value;
    const userID = assignmentUserId.value.trim();
    const targetAccountID = assignmentAccountId.value.trim();
    const valid = Boolean(role) && userID !== "" && (assignmentScope.value === "system" || targetAccountID !== "");
    if (!validate(valid, "Role, user ID, and the required account ID are required.")) return;
    await mutate(async () => {
      const request = assignmentScope.value === "account"
        ? { scope: "account" as const, account_id: targetAccountID, user_id: userID, expected_version: role!.version }
        : { scope: "system" as const, user_id: userID, expected_version: role!.version };
      await assignRoleRequest(client, role!.id, request);
      assignmentUserId.value = "";
      notice.value = "Assignment created.";
      await loadDetails();
    });
  }

  async function removeAssignment(assignmentID: string): Promise<void> {
    const role = selectedRole.value;
    if (!role || !globalThis.confirm("Revoke this role assignment?")) return;
    await mutate(async () => {
      await revokeRole(client, assignmentID, { expected_version: role.version });
      notice.value = "Assignment revoked.";
      await loadDetails();
    });
  }

  function clearFeedback(): void { notice.value = ""; formError.value = ""; }
  function validate(valid: boolean, message: string): boolean {
    clearFeedback();
    if (!valid) formError.value = message;
    return valid;
  }
  async function mutate(action: () => Promise<void>, recover?: () => Promise<void>): Promise<void> {
    clearFeedback();
    busy.value = true;
    try { await action(); } catch (error) {
      formError.value = safeError(error).message;
      if (recover) await recover();
    } finally { busy.value = false; }
  }

  onMounted(() => void loadRoles());
  return {
    roles, selectedRoleId, selectedRole, permissions, assignments, loading, detailLoading, busy,
    errorMessage, formError, notice, accountId, createName, renameName, assignmentScope,
    assignmentAccountId, assignmentUserId, loadRoles, selectRole, submitCreateRole,
    submitRenameRole, submitAssignment, removeAssignment,
  };
}

function resolveAccountID(value: string | (() => string | undefined) | undefined): string {
  return (typeof value === "function" ? value() : value) ?? "";
}
