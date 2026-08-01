<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import RoleDetailsPanel from "@/modules/authorization/components/RoleDetailsPanel.vue";
import RoleDirectoryPanel from "@/modules/authorization/components/RoleDirectoryPanel.vue";
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

const props = defineProps<{
  client: APIClient;
  accountID?: string | (() => string | undefined);
}>();

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

const accountId = ref(resolveAccountID(props.accountID));
const createName = ref("");
const renameName = ref("");
const assignmentScope = ref<"account" | "system">("account");
const assignmentAccountId = ref(accountId.value);
const assignmentUserId = ref("");

const selectedRole = computed(() =>
  roles.value.find((role) => role.id === selectedRoleId.value),
);

onMounted(() => {
  void loadRoles();
});

async function loadRoles(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";
  try {
    const result = await listRoles(props.client);
    roles.value = result.items;
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

async function loadDetails(): Promise<void> {
  const roleID = selectedRoleId.value;
  if (roleID === "") {
    permissions.value = undefined;
    assignments.value = undefined;
    renameName.value = "";
    return;
  }
  const role = roles.value.find((item) => item.id === roleID);
  renameName.value = role?.name ?? "";
  detailLoading.value = true;
  try {
    const [permissionResult, assignmentResult] = await Promise.all([
      listRolePermissions(props.client, roleID),
      listRoleAssignments(props.client, roleID),
    ]);
    permissions.value = permissionResult;
    assignments.value = assignmentResult;
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    detailLoading.value = false;
  }
}

function selectRole(roleID: string): void {
  selectedRoleId.value = roleID;
  notice.value = "";
  formError.value = "";
  void loadDetails();
}

async function submitCreateRole(): Promise<void> {
  const name = createName.value.trim();
  const targetAccountID = accountId.value.trim();
  formError.value = "";
  notice.value = "";
  if (targetAccountID === "" || name === "") {
    formError.value = "Account ID and role name are required.";
    return;
  }
  busy.value = true;
  try {
    const created = await createRoleRequest(props.client, {
      scope: "account",
      account_id: targetAccountID,
      name,
    });
    createName.value = "";
    notice.value = "Role created.";
    await loadRoles();
    selectedRoleId.value = created.id;
    await loadDetails();
  } catch (error) {
    formError.value = safeError(error).message;
  } finally {
    busy.value = false;
  }
}

async function submitRenameRole(): Promise<void> {
  const role = selectedRole.value;
  const name = renameName.value.trim();
  formError.value = "";
  notice.value = "";
  if (!role || name === "") {
    formError.value = "Select a role and enter a name.";
    return;
  }
  busy.value = true;
  try {
    const updated = await updateRole(props.client, role.id, {
      name,
      expected_version: role.version,
    });
    roles.value = roles.value.map((item) => (item.id === updated.id ? updated : item));
    renameName.value = updated.name;
    notice.value = "Role updated.";
  } catch (error) {
    formError.value = safeError(error).message;
    await loadRoles();
  } finally {
    busy.value = false;
  }
}

async function submitAssignment(): Promise<void> {
  const role = selectedRole.value;
  const userID = assignmentUserId.value.trim();
  const targetAccountID = assignmentAccountId.value.trim();
  formError.value = "";
  notice.value = "";
  if (!role || userID === "" || (assignmentScope.value === "account" && targetAccountID === "")) {
    formError.value = "Role, user ID, and the required account ID are required.";
    return;
  }
  busy.value = true;
  try {
    const request = assignmentScope.value === "account"
      ? {
          scope: "account" as const,
          account_id: targetAccountID,
          user_id: userID,
          expected_version: role.version,
        }
      : {
          scope: "system" as const,
          user_id: userID,
          expected_version: role.version,
        };
    await assignRoleRequest(props.client, role.id, request);
    assignmentUserId.value = "";
    notice.value = "Assignment created.";
    await loadDetails();
  } catch (error) {
    formError.value = safeError(error).message;
  } finally {
    busy.value = false;
  }
}

async function removeAssignment(assignmentID: string): Promise<void> {
  const role = selectedRole.value;
  if (!role || !globalThis.confirm("Revoke this role assignment?")) return;
  busy.value = true;
  formError.value = "";
  notice.value = "";
  try {
    await revokeRole(props.client, assignmentID, { expected_version: role.version });
    notice.value = "Assignment revoked.";
    await loadDetails();
  } catch (error) {
    formError.value = safeError(error).message;
  } finally {
    busy.value = false;
  }
}

function resolveAccountID(value: string | (() => string | undefined) | undefined): string {
  const resolved = typeof value === "function" ? value() : value;
  return resolved ?? "";
}
</script>

<template>
  <section
    class="role-page"
    aria-labelledby="role-administration-title"
  >
    <header class="page-header">
      <div>
        <p class="eyebrow">
          AUTHORIZATION · SYSTEM ADMINISTRATION
        </p>
        <h1 id="role-administration-title">
          Role administration
        </h1>
        <p class="intro">
          Manage account-owned roles, review their permission projection, and maintain principal assignments.
        </p>
      </div>
      <span class="scope-note">Admin URLs remain language-neutral</span>
    </header>

    <p
      v-if="notice"
      class="notice"
      role="status"
      aria-live="polite"
    >
      {{ notice }}
    </p>
    <p
      v-if="formError"
      class="error-message"
      role="alert"
    >
      {{ formError }}
    </p>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="loading"
      class="panel loading-panel"
      role="status"
    >
      Loading roles
    </div>
    <div
      v-else-if="errorMessage && roles.length === 0"
      class="panel empty-panel"
    >
      <h2>Roles unavailable</h2>
      <button
        type="button"
        @click="loadRoles"
      >
        Try again
      </button>
    </div>
    <div
      v-else
      class="role-layout"
    >
      <RoleDirectoryPanel
        v-model:account-id="accountId"
        v-model:create-name="createName"
        :roles="roles"
        :selected-role-id="selectedRoleId"
        :busy="busy"
        @create="submitCreateRole"
        @select="selectRole"
      />
      <RoleDetailsPanel
        v-if="selectedRole"
        v-model:assignment-account-id="assignmentAccountId"
        v-model:assignment-scope="assignmentScope"
        v-model:assignment-user-id="assignmentUserId"
        v-model:rename-name="renameName"
        :role="selectedRole"
        :permissions="permissions"
        :assignments="assignments"
        :detail-loading="detailLoading"
        :busy="busy"
        @assign="submitAssignment"
        @rename="submitRenameRole"
        @revoke="removeAssignment"
      />
      <aside
        v-else
        class="panel empty-panel"
      >
        <h2>Select a role</h2>
        <p>Choose a role to inspect permissions and assignments.</p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.role-page {
  width: min(90rem, 100%);
  margin-inline: auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0.65rem;
  color: #101828;
  font-size: clamp(2rem, 4vw, 3.4rem);
  letter-spacing: -0.045em;
}

h2 {
  color: #172033;
  font-size: 1.25rem;
}

.eyebrow {
  margin-bottom: 0;
  color: #526078;
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.14em;
}

.intro {
  max-width: 48rem;
  margin-bottom: 0;
  color: #526078;
  line-height: 1.6;
}

.scope-note {
  flex: 0 0 auto;
  padding-top: 0.2rem;
  color: #526078;
  font-size: 0.8rem;
  font-weight: 700;
}

.role-layout {
  display: grid;
  grid-template-columns: minmax(20rem, 0.85fr) minmax(28rem, 1.15fr);
  align-items: start;
  gap: 1rem;
}

.panel {
  min-width: 0;
  padding: clamp(1rem, 2vw, 1.4rem);
  border: 1px solid #d5dbe5;
  border-radius: 1rem;
  background: rgb(255 255 255 / 86%);
}

.notice,
.error-message {
  margin-bottom: 1rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #b8d9c1;
  border-radius: 0.55rem;
  color: #14532d;
  background: #f0fdf4;
}

.error-message {
  border-color: #f0b5bd;
  color: #881337;
  background: #fff1f2;
}

.loading-panel,
.empty-panel {
  padding-block: 3rem;
  text-align: center;
}

.empty-panel p {
  margin-bottom: 0;
  color: #667085;
}

button {
  min-height: 2.65rem;
  padding: 0.55rem 0.85rem;
  border: 1px solid #aeb9c9;
  border-radius: 0.55rem;
  color: #172033;
  background: white;
  cursor: pointer;
  font: inherit;
  font-weight: 750;
}

button:hover:not(:disabled) {
  border-color: #2563eb;
}

button:disabled {
  cursor: wait;
  opacity: 0.6;
}

@media (max-width: 72rem) {
  .role-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 42rem) {
  .page-header {
    display: block;
  }

  .scope-note {
    display: block;
    margin-top: 0.35rem;
  }
}
</style>
