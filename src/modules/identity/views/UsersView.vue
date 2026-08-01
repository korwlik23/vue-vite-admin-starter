<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { getAdminUser, listAdminUsers, updateAdminUserStatus, type AdminUserDetail, type AdminUserListItem } from "@/modules/identity/api/admin-users.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

const props = defineProps<{ client: APIClient }>();
const users = ref<AdminUserListItem[]>([]);
const selected = ref<AdminUserDetail>();
const loading = ref(true);
const detailLoading = ref(false);
const busy = ref(false);
const errorMessage = ref("");
const query = ref("");
const status = ref<"" | "active" | "disabled">("");
const selectedUserID = computed(() => selected.value?.user.id ?? "");

onMounted(() => void loadUsers());

async function loadUsers(): Promise<void> {
  loading.value = true; errorMessage.value = ""; selected.value = undefined;
  try {
    const input: Parameters<typeof listAdminUsers>[1] = { perPage: 50 };
    if (query.value.trim()) input.email = query.value.trim();
    if (status.value) input.status = status.value;
    const result = await listAdminUsers(props.client, input);
    users.value = result.items;
  } catch (error) { errorMessage.value = safeError(error).message; } finally { loading.value = false; }
}

async function selectUser(userID: string): Promise<void> {
  selected.value = undefined; detailLoading.value = true; errorMessage.value = "";
  try { selected.value = await getAdminUser(props.client, userID); } catch (error) { errorMessage.value = safeError(error).message; } finally { detailLoading.value = false; }
}

async function toggleStatus(): Promise<void> {
  const user = selected.value?.user; if (!user || busy.value) return;
  const next = user.status === "active" ? "disabled" : "active";
  if (!globalThis.confirm(`Change this user to ${next}? Active sessions will be signed out.`)) return;
  busy.value = true; errorMessage.value = "";
  try {
    const updated = await updateAdminUserStatus(props.client, user.id, next, user.authorization_version);
    selected.value = selected.value ? { ...selected.value, user: updated } : undefined;
    users.value = users.value.map((item) => item.id === updated.id ? { ...item, ...updated } : item);
  } catch (error) { errorMessage.value = safeError(error).message; await selectUser(user.id); } finally { busy.value = false; }
}
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="users-title"
  >
    <header class="page-header">
      <div>
        <p class="eyebrow">
          IDENTITY · SYSTEM ADMINISTRATION
        </p><h1 id="users-title">
          Users
        </h1><p class="intro">
          Review normalized identities, membership counts, and security status.
        </p>
      </div>
    </header>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <form
      class="filters"
      @submit.prevent="loadUsers"
    >
      <label>Email prefix<input
        v-model="query"
        type="search"
        autocomplete="off"
        placeholder="name@example.com"
      ></label>
      <label>Status<select v-model="status"><option value="">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></select></label>
      <button
        type="submit"
        :disabled="loading"
      >
        Search
      </button>
    </form>
    <div
      v-if="loading"
      class="panel state"
      role="status"
    >
      Loading users…
    </div>
    <div
      v-else-if="users.length === 0"
      class="panel state"
    >
      <h2>No users found</h2><p>Adjust the filter or invite a user through the account workflow.</p>
    </div>
    <div
      v-else
      class="layout"
    >
      <div class="panel table-wrap">
        <table>
          <caption class="sr-only">
            System users
          </caption><thead>
            <tr>
              <th scope="col">
                Email
              </th><th scope="col">
                Status
              </th><th scope="col">
                Memberships
              </th><th scope="col">
                <span class="sr-only">Action</span>
              </th>
            </tr>
          </thead><tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              :class="{ selected: user.id === selectedUserID }"
            >
              <td>{{ user.email }}</td><td>
                <span
                  class="status"
                  :data-status="user.status"
                >{{ user.status }}</span>
              </td><td>{{ user.active_membership_count }}/{{ user.membership_count }}</td><td>
                <button
                  type="button"
                  class="link-button"
                  @click="selectUser(user.id)"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <aside
        class="panel detail"
        aria-live="polite"
      >
        <div
          v-if="detailLoading"
          role="status"
        >
          Loading user detail…
        </div><div v-else-if="!selected">
          <h2>Select a user</h2><p>Choose a row to inspect memberships and security state.</p>
        </div><div v-else>
          <p class="eyebrow">
            USER DETAIL
          </p><h2>{{ selected.user.email }}</h2><dl>
            <div>
              <dt>Status</dt><dd>
                <span
                  class="status"
                  :data-status="selected.user.status"
                >{{ selected.user.status }}</span>
              </dd>
            </div><div><dt>Authorization version</dt><dd>{{ selected.user.authorization_version }}</dd></div><div><dt>Memberships</dt><dd>{{ selected.memberships.length }}</dd></div>
          </dl><button
            type="button"
            :disabled="busy"
            @click="toggleStatus"
          >
            {{ selected.user.status === "active" ? "Disable user" : "Enable user" }}
          </button><h3>Membership summary</h3><ul v-if="selected.memberships.length">
            <li
              v-for="membership in selected.memberships"
              :key="membership.id"
            >
              {{ membership.account_slug }} · {{ membership.status }}
            </li>
          </ul><p v-else>
            No memberships.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(90rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, h3, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { color: #172033; font-size: 1.25rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin-bottom: 1rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, button { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
.layout { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(19rem, .7fr); align-items: start; gap: 1rem; }
.panel { min-width: 0; padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .75rem .6rem; border-bottom: 1px solid #e5e9f0; text-align: left; white-space: nowrap; }
th { color: #526078; font-size: .76rem; }
.selected { background: #f4f7fb; }
.link-button { min-height: auto; padding: .25rem .4rem; border: 0; color: #1d4ed8; background: transparent; }
.status { color: #526078; font-size: .82rem; font-weight: 750; text-transform: capitalize; }
.status[data-status="active"] { color: #166534; }
.status[data-status="disabled"] { color: #9f1239; }
dl { display: grid; gap: .7rem; margin-bottom: 1.2rem; }
dt { color: #667085; font-size: .78rem; }
dd { margin: .15rem 0 0; color: #172033; font-weight: 700; }
li { margin-bottom: .35rem; color: #526078; }
.error-message { margin-bottom: 1rem; padding: .7rem .85rem; border: 1px solid #f0b5bd; border-radius: .55rem; color: #881337; background: #fff1f2; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 62rem) { .layout { grid-template-columns: 1fr; } }
</style>
