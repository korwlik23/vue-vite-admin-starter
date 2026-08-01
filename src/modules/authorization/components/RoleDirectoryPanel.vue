<script setup lang="ts">
import type { Role } from "@/modules/authorization/api/roles.client";

defineProps<{
  roles: readonly Role[];
  selectedRoleId: string;
  accountId: string;
  createName: string;
  busy: boolean;
}>();

defineEmits<{
  "update:accountId": [value: string];
  "update:createName": [value: string];
  select: [roleId: string];
  create: [];
}>();
</script>

<template>
  <section
    class="panel role-list-panel"
    aria-labelledby="roles-title"
  >
    <div class="panel-heading">
      <div>
        <p class="eyebrow">
          ROLES
        </p>
        <h2 id="roles-title">
          Role directory
        </h2>
      </div>
      <span class="count-label">{{ roles.length }} visible</span>
    </div>

    <form
      class="create-form"
      aria-label="Create role"
      @submit.prevent="$emit('create')"
    >
      <div class="field-grid">
        <label for="account-id">
          Account ID
          <input
            id="account-id"
            :value="accountId"
            autocomplete="off"
            required
            placeholder="account-…"
            @input="$emit('update:accountId', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <label for="role-name">
          Role name
          <input
            id="role-name"
            :value="createName"
            autocomplete="off"
            maxlength="128"
            required
            placeholder="Editors"
            @input="$emit('update:createName', ($event.target as HTMLInputElement).value)"
          >
        </label>
      </div>
      <button
        class="primary-button"
        type="submit"
        :disabled="busy"
      >
        Create role
      </button>
    </form>

    <div
      v-if="roles.length === 0"
      class="empty-table"
    >
      No roles are visible for this administration scope.
    </div>
    <div
      v-else
      class="table-wrap"
    >
      <table>
        <caption class="sr-only">
          Visible authorization roles
        </caption>
        <thead>
          <tr>
            <th scope="col">
              Name
            </th>
            <th scope="col">
              Scope
            </th>
            <th scope="col">
              Version
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="role in roles"
            :key="role.id"
            :class="{ selected: role.id === selectedRoleId }"
          >
            <td>
              <button
                class="table-select"
                type="button"
                :aria-pressed="role.id === selectedRoleId"
                @click="$emit('select', role.id)"
              >
                {{ role.name }}
              </button>
              <small>{{ role.id }}</small>
            </td>
            <td>{{ role.owner_type }}</td>
            <td>{{ role.version }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
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

.count-label {
  color: #526078;
  font-size: 0.8rem;
  font-weight: 700;
}

.create-form {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #e3e7ed;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: #344054;
  font-size: 0.78rem;
  font-weight: 750;
}

input,
button {
  min-height: 2.65rem;
  font: inherit;
}

input {
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

tr.selected td {
  background: #eef4ff;
}

.table-select {
  min-height: auto;
  padding: 0;
  border: 0;
  color: #1d4ed8;
  background: transparent;
  text-align: left;
}

td small {
  display: block;
  margin-top: 0.2rem;
  color: #667085;
  font-size: 0.7rem;
}

.empty-table {
  margin: 0;
  color: #667085;
  line-height: 1.5;
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

  .count-label {
    display: block;
    margin-top: 0.35rem;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
