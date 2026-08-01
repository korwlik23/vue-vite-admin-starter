<script setup lang="ts">
import type {
  Role,
  RoleAssignments,
  RolePermissions,
} from "@/modules/authorization/api/roles.client";

defineProps<{
  role: Role;
  permissions: RolePermissions | undefined;
  assignments: RoleAssignments | undefined;
  detailLoading: boolean;
  busy: boolean;
  renameName: string;
  assignmentScope: "account" | "system";
  assignmentAccountId: string;
  assignmentUserId: string;
}>();

defineEmits<{
  "update:renameName": [value: string];
  "update:assignmentScope": [value: "account" | "system"];
  "update:assignmentAccountId": [value: string];
  "update:assignmentUserId": [value: string];
  rename: [];
  assign: [];
  revoke: [assignmentId: string];
}>();

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
</script>

<template>
  <section
    class="detail-stack"
    aria-label="Selected role details"
  >
    <article class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">
            ROLE DETAILS
          </p>
          <h2>{{ role.name }}</h2>
        </div>
        <span class="version-label">v{{ role.version }}</span>
      </div>
      <form
        class="rename-form"
        aria-label="Rename role"
        @submit.prevent="$emit('rename')"
      >
        <label for="rename-role-name">
          Role name
          <input
            id="rename-role-name"
            :value="renameName"
            maxlength="128"
            required
            @input="$emit('update:renameName', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <button
          type="submit"
          :disabled="busy"
        >
          Save name
        </button>
      </form>
      <p class="metadata">
        Account: {{ role.account_id || "System" }} · Updated {{ formatDate(role.updated_at) }}
      </p>
    </article>

    <article class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">
            PERMISSIONS
          </p>
          <h2>Permission projection</h2>
        </div>
        <span class="count-label">{{ permissions?.items.length || 0 }} keys</span>
      </div>
      <div
        v-if="detailLoading"
        class="inline-loading"
        role="status"
      >
        Loading role details
      </div>
      <div
        v-else-if="permissions && permissions.items.length > 0"
        class="table-wrap"
      >
        <table>
          <caption class="sr-only">
            Permissions granted to the selected role
          </caption>
          <thead>
            <tr>
              <th scope="col">
                Permission key
              </th>
              <th scope="col">
                Tier
              </th>
              <th scope="col">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="permission in permissions.items"
              :key="permission.permission_key"
            >
              <td class="mono">
                {{ permission.permission_key }}
              </td>
              <td>{{ permission.tier }}</td>
              <td>{{ permission.active ? "Active" : "Inactive" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p
        v-else
        class="empty-table"
      >
        No permissions are granted to this role.
      </p>
    </article>

    <article class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">
            ASSIGNMENTS
          </p>
          <h2>Principals</h2>
        </div>
        <span class="count-label">{{ assignments?.items.length || 0 }} assigned</span>
      </div>
      <form
        class="assignment-form"
        aria-label="Assign role"
        @submit.prevent="$emit('assign')"
      >
        <label for="assignment-user-id">
          User ID
          <input
            id="assignment-user-id"
            :value="assignmentUserId"
            autocomplete="off"
            required
            placeholder="user-…"
            @input="$emit('update:assignmentUserId', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <label for="assignment-scope">
          Scope
          <select
            id="assignment-scope"
            :value="assignmentScope"
            @change="$emit('update:assignmentScope', ($event.target as HTMLSelectElement).value as 'account' | 'system')"
          >
            <option value="account">Account</option>
            <option value="system">System</option>
          </select>
        </label>
        <label
          v-if="assignmentScope === 'account'"
          for="assignment-account-id"
        >
          Account ID
          <input
            id="assignment-account-id"
            :value="assignmentAccountId"
            autocomplete="off"
            required
            @input="$emit('update:assignmentAccountId', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <button
          class="primary-button"
          type="submit"
          :disabled="busy"
        >
          Assign role
        </button>
      </form>
      <div
        v-if="assignments && assignments.items.length > 0"
        class="table-wrap"
      >
        <table>
          <caption class="sr-only">
            Principals assigned to the selected role
          </caption>
          <thead>
            <tr>
              <th scope="col">
                User ID
              </th>
              <th scope="col">
                Scope
              </th>
              <th scope="col">
                Created
              </th>
              <th scope="col">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="assignment in assignments.items"
              :key="assignment.assignment_id"
            >
              <td class="mono">
                {{ assignment.user_id }}
              </td>
              <td>{{ assignment.scope }}</td>
              <td>{{ formatDate(assignment.created_at) }}</td>
              <td>
                <button
                  class="quiet-button"
                  type="button"
                  :disabled="busy"
                  @click="$emit('revoke', assignment.assignment_id)"
                >
                  Revoke
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p
        v-else
        class="empty-table"
      >
        No principals are assigned to this role.
      </p>
    </article>
  </section>
</template>

<style scoped>
.detail-stack {
  display: grid;
  gap: 1rem;
}

.panel {
  min-width: 0;
  padding: clamp(1rem, 2vw, 1.4rem);
  border: 1px solid #d5dbe5;
  border-radius: 1rem;
  background: rgb(255 255 255 / 86%);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0;
  color: #526078;
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.14em;
}

h2 {
  margin: 0.35rem 0 0;
  color: #172033;
  font-size: 1.25rem;
}

.count-label,
.version-label {
  color: #526078;
  font-size: 0.8rem;
  font-weight: 700;
}

.rename-form,
.assignment-form {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #e3e7ed;
}

.assignment-form {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
}

label {
  display: grid;
  gap: 0.35rem;
  color: #344054;
  font-size: 0.78rem;
  font-weight: 750;
}

input,
select,
button {
  min-height: 2.65rem;
  font: inherit;
}

input,
select {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid #bfc8d6;
  border-radius: 0.55rem;
  color: #172033;
  background: white;
}

button {
  padding: 0.55rem 0.85rem;
  border: 1px solid #aeb9c9;
  border-radius: 0.55rem;
  color: #172033;
  background: white;
  cursor: pointer;
  font-weight: 750;
}

button:hover:not(:disabled) {
  border-color: #2563eb;
}

button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.primary-button {
  border-color: #172033;
  color: white;
  background: #172033;
}

.quiet-button {
  min-height: 2.2rem;
  color: #9f1239;
  border-color: #f3b5c5;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

th,
td {
  padding: 0.7rem 0.5rem;
  border-bottom: 1px solid #e3e7ed;
  text-align: left;
  vertical-align: top;
}

th {
  color: #526078;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.metadata,
.empty-table,
.inline-loading {
  margin-bottom: 0;
  color: #667085;
  line-height: 1.5;
}

.mono {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 42rem) {
  .panel-heading {
    display: block;
  }

  .count-label,
  .version-label {
    display: block;
    margin-top: 0.35rem;
  }

  .assignment-form {
    grid-template-columns: 1fr;
  }
}
</style>
